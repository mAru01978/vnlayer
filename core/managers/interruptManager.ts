// #interrupt(SwitchFlow + ObserveVariable前提の割り込み)を管理するマネージャー。
//
// 設計(2026-08-08、旧ToJson/LoadJsonマージ方式からの作り直し版 + 割り込みknot内
// 選択肢対応版):
//   - # interrupt:knot名:変数名 → 「この変数がnotifyされたら指定knotへ割り込む
//     ことを許可する」という常設の許可を登録する(明示的にclearするまで有効。
//     「置いた瞬間だけ効く使い捨てマーカー」ではない)。
//   - setContext(...)がink変数へ値を書き込むと、Story生成時に張っておいた
//     story.ObserveVariable(...)が発火する(notify:trueかどうかは無関係。
//     #wait:等の即時打ち切りはcore/managers/waitManager.ts側の責務のままで、
//     こちらとは独立に動く)。
//   - 許可済みの変数なら、story.SwitchFlow('interrupt') → ChoosePathString(knot)
//     → 完了(canContinueがfalseになる)または選択肢が出るところまで進める。
//   - 割り込みknotが選択肢を持たずそのまま終わった場合は、その場で
//     SwitchToDefaultFlow()して元フローへ戻す(以前と同じ挙動)。
//   - 割り込みknotが選択肢を持つ場合は、その場では元フローへ戻さない。
//     inkjsのSwitchFlowは「名前付きスレッドの切り替え」であり、
//     ChooseChoiceIndex/currentChoicesは常に「今アクティブなフロー」に
//     対して働くため、通常のchoose()呼び出し(core/staticStepProvider.ts)を
//     そのまま使い回せる。choose()側は毎回
//     resumeDefaultFlowIfInterruptFinished()を通すことで、「割り込みflowの
//     選択肢がついに尽きた」瞬間を検知して自動的に元フローへ戻す。
//     これにより、割り込みknot内で何段階でも選択肢を出せる。
//   - 1VNインスタンス(atomKey)につき同時に1個の割り込みだけ実行する
//     (選択肢待ちで一時停止している間も「実行中」として扱う)。
//     実行中に別の許可済み変数がnotifyされたら、キューに積んで直列化する。
//   - まだ許可が無い時に来たイベントは、変数名ごとに最新の1件だけpendingとして
//     保持し、後から# interrupt:knot:変数名で許可された瞬間に発火させる。
//
// Storyインスタンス自体の生成・保持はcore/staticStepProvider.ts(または将来の
// サーバー版)側の責務。このマネージャーは「Storyを操作する権限(host)」を
// attachStory()で受け取るだけで、Storyインスタンスそのものは持たない。
import type { Story } from 'inkjs';
import { continueUntilChoice } from '../inkStepRunner';
import type { RunResult, VisualState } from '../types';
import { InterruptError, reportError } from '../errors';

export type InterruptHost = {
  story: Story;
  getVisual: () => VisualState;
  setVisual: (visual: VisualState) => void;
  // 割り込みで発生したsteps + (割り込みflow自身の選択肢、またはflowが
  // 完了して元フローへ戻った後の選択肢)をまとめたRunResultを、呼び出し側
  // (StepProvider.onPush経由で購読しているcore/useStoryEngine.ts)へpushする。
  pushResult: (result: RunResult) => void;
};

const FLOW_NAME = 'interrupt';

const permissions = new Map<string, Map<string, string>>(); // atomKey -> (varName -> knot)
const pendingValues = new Map<string, Map<string, unknown>>(); // atomKey -> (varName -> 最新値)
// 「実行中」= 割り込みflowが呼ばれてから、元フローへ戻り終わるまで
// (途中で選択肢待ちになっている間も含む)。
const inProgress = new Map<string, boolean>();
const queue = new Map<string, string[]>(); // atomKey -> 待機中のknot名の列
const hosts = new Map<string, InterruptHost>();
const observedVars = new Map<string, Set<string>>();

function getPermissionMap(atomKey: string): Map<string, string> {
  let m = permissions.get(atomKey);
  if (!m) {
    m = new Map();
    permissions.set(atomKey, m);
  }
  return m;
}

function getPendingMap(atomKey: string): Map<string, unknown> {
  let m = pendingValues.get(atomKey);
  if (!m) {
    m = new Map();
    pendingValues.set(atomKey, m);
  }
  return m;
}

function getQueue(atomKey: string): string[] {
  let q = queue.get(atomKey);
  if (!q) {
    q = [];
    queue.set(atomKey, q);
  }
  return q;
}

function ensureObserved(atomKey: string, varName: string): void {
  const host = hosts.get(atomKey);
  const observed = observedVars.get(atomKey);
  if (!host || !observed || observed.has(varName)) return;
  observed.add(varName);
  host.story.ObserveVariable(varName, (name: string, newValue: unknown) => {
    onVariableChanged(atomKey, name, newValue);
  });
}

// core/staticStepProvider.ts(または将来のサーバー版)側が、Story生成直後に
// 1回呼ぶ。既に登録済みの許可があれば、この時点でまとめて監視を開始する
// (例: resetStory()で作り直されたStoryに、直前まで有効だった許可を
// そのまま引き継がせたい場合)。
export function attachStory(atomKey: string, host: InterruptHost): void {
  hosts.set(atomKey, host);
  observedVars.set(atomKey, new Set());
  for (const varName of getPermissionMap(atomKey).keys()) {
    ensureObserved(atomKey, varName);
  }
}

// # interrupt:knot名:変数名 用。
export function registerPermission(atomKey: string, knot: string, varName: string): void {
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
export function clearAll(atomKey: string): void {
  getPermissionMap(atomKey).clear();
}

// # interrupt:clear:変数名 用。
export function clearVar(atomKey: string, varName: string): void {
  getPermissionMap(atomKey).delete(varName);
}

function onVariableChanged(atomKey: string, varName: string, value: unknown): void {
  const knot = getPermissionMap(atomKey).get(varName);
  if (!knot) {
    // まだ許可が無い: 最新値だけ覚えておき、後で許可された時に発火させる。
    getPendingMap(atomKey).set(varName, value);
    return;
  }
  enqueueOrRun(atomKey, knot);
}

function enqueueOrRun(atomKey: string, knot: string): void {
  if (inProgress.get(atomKey)) {
    // 選択肢待ちで一時停止中も含めて「実行中」なので、ここに来た分は
    // 素直に順番待ちさせる(直列化)。
    getQueue(atomKey).push(knot);
    return;
  }
  runInterrupt(atomKey, knot);
}

function drainQueue(atomKey: string): void {
  const next = getQueue(atomKey).shift();
  if (next) runInterrupt(atomKey, next);
}

function runInterrupt(atomKey: string, knot: string): void {
  const host = hosts.get(atomKey);
  if (!host) return;
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
  } catch (e) {
    reportError(new InterruptError(`interrupt knot "${knot}" failed`, { cause: e }));
    try {
      host.story.SwitchToDefaultFlow();
    } catch {
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
export function resumeDefaultFlowIfInterruptFinished(
  atomKey: string,
  story: Story,
  result: RunResult,
): RunResult {
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
export function isInterrupting(atomKey: string): boolean {
  return inProgress.get(atomKey) ?? false;
}

export function dispose(atomKey: string): void {
  permissions.delete(atomKey);
  pendingValues.delete(atomKey);
  inProgress.delete(atomKey);
  queue.delete(atomKey);
  hosts.delete(atomKey);
  observedVars.delete(atomKey);
}
