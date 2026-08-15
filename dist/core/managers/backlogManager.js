// このVNインスタンス専用のバックログ(会話ログ)を管理するマネージャー。
// #ui:backlog:clear タグ、core/useStoryEngine.tsのadvance()/choose()
// (発言・選択の記録)から呼ばれる。
//
// global/perInstance統合表示(#ui:backlog:mode:global)の判定もここに
// 集約した。以前はcore/useStoryEngine.ts側で「pushする直前にgetUiConfig()を
// 見てglobalBacklogにもpushするかどうか決める」という分岐を毎回書いて
// いたが、その判断ごとバックログの管理責務としてここに寄せている。
// mode判定はtags/uiConfig.tsの実効設定(instanceIdスコープ)を見るため、
// atomKey(自分のlinesの隔離キー)とは別にinstanceId(公開スコープ識別子、
// 全VN共通バックログでの「どのVNからのログか」の表示にも使う)も受け取る。
import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { getStore } from "../store";
import { getUiConfig } from "../../tags/uiConfig";
import { pushGlobalBacklogEntry, clearGlobalBacklog } from "../globalBacklog";
export const linesAtomFamily = atomFamily((_atomKey) => atom([]));
function pushEntry(atomKey, instanceId, entry) {
  const store = getStore();
  const target = linesAtomFamily(atomKey);
  store.set(target, [...store.get(target), entry]);
  // 修正メモ(2026-08-09): 以前は「自分のbacklog.modeがglobalの時だけ」全VN
  // 共通バックログへも書き込んでいたが、これだと「#ui:backlog:mode:global を
  // 設定したVN自身」の発言しか共通ログに乗らず、他のVNインスタンス側でも
  // 個別にmode:globalを設定しない限りそちらの発言は一切共通ログに現れない、
  // という分かりにくい挙動になっていた(mode:globalが「自分の発言を共通ログへ
  // 提供するか」と「共通ログを自分の表示に使うか」の両方を兼ねてしまっていた
  // のが原因)。常に全VNインスタンスの発言を共通ログへ書き込むようにし、
  // mode:globalは「どちらを表示するか」の切り替えだけに責務を絞った。
  pushGlobalBacklogEntry(entry, instanceId);
}
export function pushLine(atomKey, instanceId, speaker, content) {
  pushEntry(atomKey, instanceId, { kind: "line", speaker, content });
}
export function pushChoice(atomKey, instanceId, number, text) {
  pushEntry(atomKey, instanceId, { kind: "choice", number, text });
}
export function getLines(atomKey) {
  return getStore().get(linesAtomFamily(atomKey));
}
// 簡易セーブ機能(core/SaveProvider.ts)の復元専用。保存時点のlinesを
// そのまま丸ごと置き換える(pushLine/pushChoiceのようなglobalBacklogへの
// 追記は行わない — 全VN共通バックログはページ全体で共有される別レジストリ
// のため、1インスタンスの復元で勝手に再投入すると、他インスタンス分と
// 順序が混ざったり二重に見えたりする恐れがある。復元後に新しく発生した
// 行からまたglobalBacklogにも積まれていく)。
// 簡易セーブ機能(core/SaveProvider.ts)の復元専用。保存時点のlinesを
// そのまま丸ごと置き換える。pushEntry()と同じ方針(2026-08-09修正)で、
// 常に全VN共通バックログへも書き戻す(instanceIdごとのmode:global設定に
// 関わらず — mode:globalは「どちらを表示するか」の切り替えだけの責務)。
// これを怠ると、#ui:backlog:mode:globalを使っている場合に「復元直後は
// バックログが空に見える」不具合になる(表示側は共通ログを見ているのに、
// 復元がインスタンス専用ログにしか書いていなかったため)。
export function restore(atomKey, instanceId, lines) {
  getStore().set(linesAtomFamily(atomKey), lines);
  for (const line of lines) {
    pushGlobalBacklogEntry(line, instanceId);
  }
}
// #ui:backlog:clear 用。実効設定がmode:'global'なら全VN共通のバックログも
// クリアする(perInstanceならこのインスタンスのlinesだけをクリアする)。
export function clear(atomKey, instanceId) {
  getStore().set(linesAtomFamily(atomKey), []);
  if (getUiConfig(instanceId).backlog.mode === "global") {
    clearGlobalBacklog();
  }
}
// resetStory()用。注意: 全VN共通のバックログ(core/globalBacklog.ts)は、
// 他のVNインスタンスの分も含んだ共有ログのため、このインスタンス1つの
// resetでは意図的にクリアしない(#ui:backlog:clearによる明示的なクリアのみ
// クリア対象にする、という以前からの設計判断を踏襲)。
export function reset(atomKey) {
  getStore().set(linesAtomFamily(atomKey), []);
}
export function dispose(atomKey) {
  linesAtomFamily.remove(atomKey);
}
//# sourceMappingURL=backlogManager.js.map
