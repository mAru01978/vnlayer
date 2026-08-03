// VNLayer.setContext()/getContext() (core/useStoryEngine.tsのsetContextVars/
// getContextVars)が書き込む値のローカルの写しと、notify:true時の
// "${key}_seq"自動採番・wake(interrupt)処理をまとめたマネージャー。
//
// 実際にink変数へ反映する処理(stepProvider.idle(scenario, varName, value)の
// 呼び出しループ)は、そのVNインスタンスが使っているStepProvider/scenarioに
// 依存するため、こちらには持たせず core/useStoryEngine.ts 側に残している
// (prepareWrite()が返す「書き込むべきvars」を使って、呼び出し側がidle()
// ループを回す、という役割分担)。
import * as waitManager from "./waitManager";
const contextStore = new Map();
const contextSeq = new Map();
const lastWakeAt = new Map();
const WAKE_THROTTLE_MS = 50;
function getStoreRecord(atomKey) {
  let record = contextStore.get(atomKey);
  if (!record) {
    record = {};
    contextStore.set(atomKey, record);
  }
  return record;
}
function getSeqRecord(atomKey) {
  let record = contextSeq.get(atomKey);
  if (!record) {
    record = {};
    contextSeq.set(atomKey, record);
  }
  return record;
}
// notify()が短時間(mousemove等)に大量連続で呼ばれた場合の保険。値の
// 書き込み自体は毎回やる(データとしては欠けない)が、「実行中のwait/
// type_wait待ちを打ち切る」効果の方は一定間隔に間引く。単発の本来の
// 使い方(クリック等)ではこの間隔より間が空くのが普通なので体感には
// 影響しない。
function wake(atomKey) {
  const now = Date.now();
  const last = lastWakeAt.get(atomKey) ?? 0;
  if (now - last < WAKE_THROTTLE_MS) return;
  lastWakeAt.set(atomKey, now);
  waitManager.interrupt(atomKey);
}
// setContextVars(vars, options?)の下ごしらえ。
//   options.notify: true → 各キーに"${key}_seq"を自動生成・インクリメント
//     して一緒に書き込み、wake()する。
//   options.expose: false → ローカルストア(getContextVars()から見える値)
//     への反映をスキップする。
// 戻り値は「実際にink変数へ書き込むべき(_seq込みの)vars」。
export function prepareWrite(atomKey, vars, options) {
  let toWrite = vars;
  if (options?.notify) {
    wake(atomKey);
    const seqRecord = getSeqRecord(atomKey);
    const withSeq = { ...vars };
    for (const key of Object.keys(vars)) {
      const nextSeq = (seqRecord[key] ?? 0) + 1;
      seqRecord[key] = nextSeq;
      withSeq[`${key}_seq`] = nextSeq;
    }
    toWrite = withSeq;
  }
  if (options?.expose !== false) {
    const store = getStoreRecord(atomKey);
    Object.assign(store, toWrite);
  }
  return toWrite;
}
export function getContextVars(atomKey, varNames) {
  const store = getStoreRecord(atomKey);
  if (!varNames || varNames.length === 0) {
    return { ...store };
  }
  const result = {};
  for (const name of varNames) {
    result[name] = store[name];
  }
  return result;
}
export function reset(atomKey) {
  contextStore.set(atomKey, {});
}
export function dispose(atomKey) {
  contextStore.delete(atomKey);
  contextSeq.delete(atomKey);
  lastWakeAt.delete(atomKey);
}
//# sourceMappingURL=contextManager.js.map
