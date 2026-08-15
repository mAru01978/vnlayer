import { continueUntilChoice } from "../inkStepRunner";
import { InterruptError, reportError } from "../errors";
const FLOW_NAME_PREFIX = "interrupt_";
let flowCounter = 0;
const permissions = new Map(); // atomKey -> (varName -> knot)
const pendingValues = new Map(); // atomKey -> (varName -> 許可待ちの最新値)
const openFlows = new Map(); // atomKey -> 現在開いている割り込みflow名の集合
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
function getOpenFlows(atomKey) {
    let set = openFlows.get(atomKey);
    if (!set) {
        set = new Set();
        openFlows.set(atomKey, set);
    }
    return set;
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
// 1回呼ぶ。既に登録済みの許可があれば、この時点でまとめて監視を開始する。
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
        runInterrupt(atomKey, knot);
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
    // 許可済みなら、他の割り込みが実行中かどうかに関わらず即座に(並列に)開始する。
    runInterrupt(atomKey, knot);
}
function runInterrupt(atomKey, knot) {
    const host = hosts.get(atomKey);
    if (!host)
        return;
    flowCounter += 1;
    const flowName = `${FLOW_NAME_PREFIX}${flowCounter}`;
    getOpenFlows(atomKey).add(flowName);
    try {
        const { story } = host;
        story.SwitchFlow(flowName);
        story.ChoosePathString(knot);
        const result = continueUntilChoice(story, host.getVisual());
        host.setVisual(result.visual);
        const finalResult = finishFlowIfDone(atomKey, story, result);
        host.pushResult(finalResult);
    }
    catch (e) {
        reportError(new InterruptError(`interrupt knot "${knot}" failed`, { cause: e }));
        getOpenFlows(atomKey).delete(flowName);
        try {
            host.story.SwitchToDefaultFlow();
            host.story.RemoveFlow(flowName);
        }
        catch {
            // 元フローへ戻す/flowの後始末に失敗しても、これ以上打つ手が無いため
            // ここでは黙って諦める(このVNインスタンスは要リロード状態になりうる)。
        }
    }
}
// core/staticStepProvider.ts側のchoose()が、通常のChooseChoiceIndex+
// continueUntilChoiceを行った後に必ず通す。「今アクティブなフローが
// デフォルトフローではなく(=いずれかの割り込みflow中)、かつ選択肢が
// 尽きた」場合だけ、そのflowを畳んでSwitchToDefaultFlow()し、一時停止
// していた元フローの選択肢に差し替えて返す。それ以外(割り込み中でない、
// または割り込みflowの選択肢がまだ続く)場合はresultをそのまま返す。
//
// 複数のflowが同時に開いていても、「今アクティブなflow」は常に1つ
// (story.currentFlowName)なので、この関数はそのflow1つの完了判定だけを
// 行えばよい。呼び出し元(choose())自体がcore/staticStepProvider.tsの
// atomKeyごとのmutexで直列化されているため、たまたま複数のflowが
// ほぼ同時に完了しようとしても、実際のSwitchToDefaultFlow呼び出し同士が
// 競合することはない。
export function finishFlowIfDone(atomKey, story, result) {
    if (story.currentFlowIsDefaultFlow || result.choices.length > 0) {
        return result;
    }
    const finishedFlowName = story.currentFlowName;
    story.SwitchToDefaultFlow();
    try {
        story.RemoveFlow(finishedFlowName);
    }
    catch {
        // 削除に失敗しても致命的ではない(同名を使い回すことは無い ―
        // flowCounterで毎回新しい名前を発行しているため ― のでリークするだけ)。
    }
    getOpenFlows(atomKey).delete(finishedFlowName);
    const resumedChoices = story.currentChoices.map((c, i) => ({
        text: c.text,
        index: i,
        tags: c.tags ?? [],
    }));
    return {
        steps: result.steps,
        choices: resumedChoices,
        visual: result.visual,
    };
}
// 後方互換のエイリアス(旧名)。core/staticStepProvider.ts側もこちらの
// 新名(finishFlowIfDone)を使うよう更新済みだが、念のため同じ実体を
// 別名でも参照できるようにしておく。
export const resumeDefaultFlowIfInterruptFinished = finishFlowIfDone;
// 今このVNインスタンスで、何らかの割り込みflowが開いている(選択肢待ちを
// 含む)かどうか。
export function isInterrupting(atomKey) {
    return getOpenFlows(atomKey).size > 0;
}
export function dispose(atomKey) {
    permissions.delete(atomKey);
    pendingValues.delete(atomKey);
    openFlows.delete(atomKey);
    hosts.delete(atomKey);
    observedVars.delete(atomKey);
}
//# sourceMappingURL=interruptManager.js.map