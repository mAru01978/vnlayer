import { continueUntilChoice } from '../inkStepRunner';
import { InterruptError, reportError } from '../errors';
const FLOW_NAME = 'interrupt';
const permissions = new Map(); // atomKey -> (varName -> knot)
const pendingValues = new Map(); // atomKey -> (varName -> 最新値)
// 「実行中」= 割り込みflowが呼ばれてから、元フローへ戻り終わるまで
// (途中で選択肢待ちになっている間も含む)。
const inProgress = new Map();
const queue = new Map(); // atomKey -> 待機中のknot名の列
const hosts = new Map();
const observedVars = new Map();
function getPermissionMap(atomKey) {
    let m = permissions.get(atomKey);
    if (!m) {
        m = new Map();
        permissions.set(atomKey, m);
    }
    return m;
}
function getPendingMap(atomKey) {
    let m = pendingValues.get(atomKey);
    if (!m) {
        m = new Map();
        pendingValues.set(atomKey, m);
    }
    return m;
}
function getQueue(atomKey) {
    let q = queue.get(atomKey);
    if (!q) {
        q = [];
        queue.set(atomKey, q);
    }
    return q;
}
function ensureObserved(atomKey, varName) {
    const host = hosts.get(atomKey);
    const observed = observedVars.get(atomKey);
    if (!host || !observed || observed.has(varName))
        return;
    observed.add(varName);
    host.story.ObserveVariable(varName, (name, newValue) => {
        onVariableChanged(atomKey, name, newValue);
    });
}
// core/staticStepProvider.ts(または将来のサーバー版)側が、Story生成直後に
// 1回呼ぶ。既に登録済みの許可があれば、この時点でまとめて監視を開始する
// (例: resetStory()で作り直されたStoryに、直前まで有効だった許可を
// そのまま引き継がせたい場合)。
export function attachStory(atomKey, host) {
    hosts.set(atomKey, host);
    observedVars.set(atomKey, new Set());
    for (const varName of getPermissionMap(atomKey).keys()) {
        ensureObserved(atomKey, varName);
    }
}
// # interrupt:knot名:変数名 用。
export function registerPermission(atomKey, knot, varName) {
    getPermissionMap(atomKey).set(varName, knot);
    ensureObserved(atomKey, varName);
    // 許可される前に既にこの変数がnotifyされていた場合、その最新値ぶんを
    // 今すぐ発火させる。
    const pendingMap = getPendingMap(atomKey);
    if (pendingMap.has(varName)) {
        pendingMap.delete(varName);
        enqueueOrRun(atomKey, knot);
    }
}
// # interrupt:clear 用。
export function clearAll(atomKey) {
    getPermissionMap(atomKey).clear();
}
// # interrupt:clear:変数名 用。
export function clearVar(atomKey, varName) {
    getPermissionMap(atomKey).delete(varName);
}
function onVariableChanged(atomKey, varName, value) {
    const knot = getPermissionMap(atomKey).get(varName);
    if (!knot) {
        // まだ許可が無い: 最新値だけ覚えておき、後で許可された時に発火させる。
        getPendingMap(atomKey).set(varName, value);
        return;
    }
    enqueueOrRun(atomKey, knot);
}
function enqueueOrRun(atomKey, knot) {
    if (inProgress.get(atomKey)) {
        // 選択肢待ちで一時停止中も含めて「実行中」なので、ここに来た分は
        // 素直に順番待ちさせる(直列化)。
        getQueue(atomKey).push(knot);
        return;
    }
    runInterrupt(atomKey, knot);
}
function drainQueue(atomKey) {
    const next = getQueue(atomKey).shift();
    if (next)
        runInterrupt(atomKey, next);
}
function runInterrupt(atomKey, knot) {
    const host = hosts.get(atomKey);
    if (!host)
        return;
    inProgress.set(atomKey, true);
    try {
        const { story } = host;
        story.SwitchFlow(FLOW_NAME);
        story.ChoosePathString(knot);
        const result = continueUntilChoice(story, host.getVisual());
        host.setVisual(result.visual);
        // 選択肢を持たずそのまま終わった場合はここで即座に元フローへ戻る。
        // 選択肢を持つ場合はresumeDefaultFlowIfInterruptFinished内部で
        // 「まだ戻さない」と判定され、inProgressはtrueのまま維持される
        // (=次の通常choose()呼び出しがこの割り込みflow上で継続処理される)。
        const finalResult = resumeDefaultFlowIfInterruptFinished(atomKey, story, result);
        host.pushResult(finalResult);
    }
    catch (e) {
        reportError(new InterruptError(`interrupt knot "${knot}" failed`, { cause: e }));
        try {
            host.story.SwitchToDefaultFlow();
        }
        catch {
            // 元フローへ戻すこと自体にも失敗した場合、これ以上打つ手が無いため
            // ここでは黙って諦める(このVNインスタンスは要リロード状態になりうる)。
        }
        inProgress.set(atomKey, false);
        drainQueue(atomKey);
    }
}
// core/staticStepProvider.ts側のchoose()が、通常のChooseChoiceIndex+
// continueUntilChoiceを行った後に必ず通す。「今アクティブなフローが
// デフォルトフローではなく(=割り込み中)、かつ選択肢が尽きた」場合だけ、
// 自動でSwitchToDefaultFlow()し、一時停止していた元フローの選択肢に
// 差し替えて返す。それ以外(割り込み中でない、または割り込みflowの
// 選択肢がまだ続く)場合はresultをそのまま返す。
//
// これにより、割り込みknot内で何段階でも選択肢を出せる: ユーザーが
// 割り込みflowの選択肢を選ぶたびにこの関数が呼ばれ、まだ続くならそのまま
// 割り込みflow上での進行として扱われ、ついに終わったタイミングで初めて
// 元フローへ戻る。
export function resumeDefaultFlowIfInterruptFinished(atomKey, story, result) {
    if (story.currentFlowIsDefaultFlow || result.choices.length > 0) {
        return result;
    }
    story.SwitchToDefaultFlow();
    const resumedChoices = story.currentChoices.map((c, i) => ({
        text: c.text,
        index: i,
        tags: c.tags ?? [],
    }));
    inProgress.set(atomKey, false);
    drainQueue(atomKey);
    return { steps: result.steps, choices: resumedChoices, visual: result.visual };
}
// 今このVNインスタンスが割り込みflow内で選択肢待ちになっているかどうか。
// core/staticStepProvider.ts側でのデバッグ・分岐判断に使えるよう公開しておく
// (通常のchoose()自体はstory.currentFlowIsDefaultFlowを直接見れば十分なので
// 必須ではないが、hostを持たない外部からの問い合わせ用に用意)。
export function isInterrupting(atomKey) {
    return inProgress.get(atomKey) ?? false;
}
export function dispose(atomKey) {
    permissions.delete(atomKey);
    pendingValues.delete(atomKey);
    inProgress.delete(atomKey);
    queue.delete(atomKey);
    hosts.delete(atomKey);
    observedVars.delete(atomKey);
}
//# sourceMappingURL=interruptManager.js.map