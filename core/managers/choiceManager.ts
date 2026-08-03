// 現在の選択肢一覧と、選択肢ボックス自体の表示/非表示を管理するマネージャー。
// choicesAtomFamily自体はink側の進行(init/choose/reset)の結果を反映する
// だけなので、実質的にcore/useStoryEngine.tsの advance() からのみ書き込まれる。
// choicesHiddenは#ui:choice:show:on/offタグから書き込まれる。
import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { getStore } from "../store";
import type { Choice } from "../types";

export const choicesAtomFamily = atomFamily((_atomKey: string) =>
  atom<Choice[]>([]),
);
export const choicesHiddenAtomFamily = atomFamily((_atomKey: string) =>
  atom(false),
);

export function setChoices(atomKey: string, choices: Choice[]): void {
  getStore().set(choicesAtomFamily(atomKey), choices);
}

export function getChoices(atomKey: string): Choice[] {
  return getStore().get(choicesAtomFamily(atomKey));
}

export function setChoicesVisible(atomKey: string, visible: boolean): void {
  getStore().set(choicesHiddenAtomFamily(atomKey), !visible);
}

export function reset(atomKey: string): void {
  getStore().set(choicesAtomFamily(atomKey), []);
  getStore().set(choicesHiddenAtomFamily(atomKey), false);
}

export function dispose(atomKey: string): void {
  choicesAtomFamily.remove(atomKey);
  choicesHiddenAtomFamily.remove(atomKey);
}
