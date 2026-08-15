// #interrupt(SwitchFlow + ObserveVariable前提の割り込み)を管理するマネージャー。
//
// 設計(2026-08-08、並列割り込み対応版 — 旧「1インスタンス同時1件まで」方式
// からの作り直し):
//   - # interrupt:knot名:変数名 → 「この変数がnotifyされたら指定knotへ割り込む
//     ことを許可する」という常設の許可を登録する(明示的にclearするまで有効)。
//   - 許可済みの変数がnotifyされるたびに、そのつど専用の新しい名前付きflow
//     (interrupt_1, interrupt_2, ...)を発行してSwitchFlowする。これにより
//     複数の割り込みが同時に発生しても、互いに待たされることなくそれぞれ
//     即座に反応・進行できる(以前あった「1インスタンス同時1件まで」「1件
//     だけのpending」という制約を撤廃した)。
//   - 割り込みflowが選択肢無しで完了した瞬間、そのflowだけを畳んで
//     SwitchToDefaultFlow()する。複数のflowがたまたま同じタイミングで
//     完了しようとしても、実際の完了処理(SwitchToDefaultFlow+
//     currentChoicesの読み取り)自体はJS(シングルスレッド)+
//     core/staticStepProvider.ts側のatomKeyごとの簡易mutexにより自然に
//     一件ずつ直列に処理される(「入口は並列、合流だけ一部直列」という
//     設計はこの2つの組み合わせで実現している。このファイル自身は
//     mutexを持たない — story操作の直列化はcore/staticStepProvider.ts
//     の責務)。
//   - 同じ変数を複数の#interruptから同時に書いた場合の整合性(競合)は
//     保証しない(並列実行を優先するための意図的なトレードオフ)。整合性が
//     必要な場面は、呼び出し側で別々の変数を使うことで回避できる。
//   - まだ許可が無い時に来たイベントは、変数名ごとに最新の1件だけpendingと
//     して保持し、後から# interrupt:knot:変数名で許可された瞬間に発火させる
//     (この「1件だけ」は許可待ちの間だけの制約で、許可後の並列実行数には
//     制限をかけない)。
//
// Storyインスタンス自体の生成・保持・直列化はcore/staticStepProvider.ts
// (または将来のサーバー版)側の責務。このマネージャーは「Storyを操作する
// 権限(host)」をattachStory()で受け取るだけで、Storyインスタンスそのものは
// 持たない。
//
// 割り込みknot自体は選択肢を出してもよい(何段階でもOK、tags/defs/special/
// interrupt.ts参照)。完了判定はfinishFlowIfDone()に集約している。
import type { Story } from "inkjs";
import { continueUntilChoice } from "../inkStepRunner";
import type { RunResult, VisualState } from "../types";
import { InterruptError, reportError } from "../errors";

export type InterruptHost = {
  story: Story;
  getVisual: () => VisualState;
  setVisual: (visual: VisualState) => void;
  // 割り込みで発生したsteps + (割り込みflow自身の選択肢、またはflowが
  // 完了して元フローへ戻った後の選択肢)をまとめたRunResultを、呼び出し側
  // (StepProvider.onPush経由で購読しているcore/useStoryEngine.ts)へpushする。
  pushResult: (result: RunResult) => void;
};

const FLOW_NAME_PREFIX = "interrupt_";
let flowCounter = 0;

const permissions = new Map<string, Map<string, string>>(); // atomKey -> (varName -> knot)
const pendingValues = new Map<string, Map<string, unknown>>(); // atomKey -> (varName -> 許可待ちの最新値)
const openFlows = new Map<string, Set<string>>(); // atomKey -> 現在開いている割り込みflow名の集合
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

function getOpenFlows(atomKey: string): Set<string> {
  let set = openFlows.get(atomKey);
  if (!set) {
    set = new Set();
    openFlows.set(atomKey, set);
  }
  return set;
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
// 1回呼ぶ。既に登録済みの許可があれば、この時点でまとめて監視を開始する。
export function attachStory(atomKey: string, host: InterruptHost): void {
  hosts.set(atomKey, host);
  observedVars.set(atomKey, new Set());
  for (const varName of getPermissionMap(atomKey).keys()) {
    ensureObserved(atomKey, varName);
  }
}

// # interrupt:knot名:変数名 用。
export function registerPermission(
  atomKey: string,
  knot: string,
  varName: string,
): void {
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
export function clearAll(atomKey: string): void {
  getPermissionMap(atomKey).clear();
}

// # interrupt:clear:変数名 用。
export function clearVar(atomKey: string, varName: string): void {
  getPermissionMap(atomKey).delete(varName);
}

function onVariableChanged(
  atomKey: string,
  varName: string,
  value: unknown,
): void {
  const knot = getPermissionMap(atomKey).get(varName);
  if (!knot) {
    // まだ許可が無い: 最新値だけ覚えておき、後で許可された時に発火させる。
    getPendingMap(atomKey).set(varName, value);
    return;
  }
  // 許可済みなら、他の割り込みが実行中かどうかに関わらず即座に(並列に)開始する。
  runInterrupt(atomKey, knot);
}

function runInterrupt(atomKey: string, knot: string): void {
  const host = hosts.get(atomKey);
  if (!host) return;

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
  } catch (e) {
    reportError(
      new InterruptError(`interrupt knot "${knot}" failed`, { cause: e }),
    );
    getOpenFlows(atomKey).delete(flowName);
    try {
      host.story.SwitchToDefaultFlow();
      host.story.RemoveFlow(flowName);
    } catch {
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
export function finishFlowIfDone(
  atomKey: string,
  story: Story,
  result: RunResult,
): RunResult {
  if (story.currentFlowIsDefaultFlow || result.choices.length > 0) {
    return result;
  }

  const finishedFlowName = story.currentFlowName;
  story.SwitchToDefaultFlow();
  try {
    story.RemoveFlow(finishedFlowName);
  } catch {
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
export function isInterrupting(atomKey: string): boolean {
  return getOpenFlows(atomKey).size > 0;
}

export function dispose(atomKey: string): void {
  permissions.delete(atomKey);
  pendingValues.delete(atomKey);
  openFlows.delete(atomKey);
  hosts.delete(atomKey);
  observedVars.delete(atomKey);
}
