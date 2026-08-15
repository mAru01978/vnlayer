// メッセージウィンドウ(吹き出し・ナレーションキャプション)全体の
// Scene単位の表示/非表示(#ui:messageWindow:show:on/off)を管理する
// マネージャー。個々のメッセージの内容(messageManager)とは別物。
import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { getStore } from "../store";
export const messageWindowHiddenAtomFamily = atomFamily((_atomKey) => atom(false));
export function setMessageWindowVisible(atomKey, visible) {
    getStore().set(messageWindowHiddenAtomFamily(atomKey), !visible);
}
export function reset(atomKey) {
    getStore().set(messageWindowHiddenAtomFamily(atomKey), false);
}
export function dispose(atomKey) {
    messageWindowHiddenAtomFamily.remove(atomKey);
}
//# sourceMappingURL=windowVisibilityManager.js.map