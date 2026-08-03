// 現在の話者(speaker)を管理するマネージャー。#s(sprite)タグ、および
// core/useStoryEngine.tsのadvance()自体(文章行の話者・ink側スナップショット
// との同期)の両方から書き込まれる、比較的単純な状態。
import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { getStore } from "../store";

export const speakerAtomFamily = atomFamily((_atomKey: string) => atom(""));

export function setSpeaker(atomKey: string, name: string): void {
  getStore().set(speakerAtomFamily(atomKey), name);
}

export function getSpeaker(atomKey: string): string {
  return getStore().get(speakerAtomFamily(atomKey));
}

export function reset(atomKey: string): void {
  getStore().set(speakerAtomFamily(atomKey), "");
}

export function dispose(atomKey: string): void {
  speakerAtomFamily.remove(atomKey);
}
