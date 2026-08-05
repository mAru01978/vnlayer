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
    if (getUiConfig(instanceId).backlog.mode === "global") {
        pushGlobalBacklogEntry(entry, instanceId);
    }
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