// メッセージウィンドウ(吹き出し・ナレーションキャプション)全体の
// Scene単位の表示/非表示(#ui:messageWindow:show:on/off)を管理する
// マネージャー。個々のメッセージの内容(messageManager)とは別物。
import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { getStore } from "../store";

export const messageWindowHiddenAtomFamily = atomFamily((_atomKey: string) =>
  atom(false),
);

export function setMessageWindowVisible(
  atomKey: string,
  visible: boolean,
): void {
  getStore().set(messageWindowHiddenAtomFamily(atomKey), !visible);
}

export function reset(atomKey: string): void {
  getStore().set(messageWindowHiddenAtomFamily(atomKey), false);
}

export function dispose(atomKey: string): void {
  messageWindowHiddenAtomFamily.remove(atomKey);
}
