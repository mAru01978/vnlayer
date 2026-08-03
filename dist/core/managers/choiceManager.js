// 現在の選択肢一覧と、選択肢ボックス自体の表示/非表示を管理するマネージャー。
// choicesAtomFamily自体はink側の進行(init/choose/reset)の結果を反映する
// だけなので、実質的にcore/useStoryEngine.tsの advance() からのみ書き込まれる。
// choicesHiddenは#ui:choice:show:on/offタグから書き込まれる。
import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { getStore } from "../store";
export const choicesAtomFamily = atomFamily((_atomKey) => atom([]));
export const choicesHiddenAtomFamily = atomFamily((_atomKey) => atom(false));
export function setChoices(atomKey, choices) {
  getStore().set(choicesAtomFamily(atomKey), choices);
}
export function getChoices(atomKey) {
  return getStore().get(choicesAtomFamily(atomKey));
}
export function setChoicesVisible(atomKey, visible) {
  getStore().set(choicesHiddenAtomFamily(atomKey), !visible);
}
export function reset(atomKey) {
  getStore().set(choicesAtomFamily(atomKey), []);
  getStore().set(choicesHiddenAtomFamily(atomKey), false);
}
export function dispose(atomKey) {
  choicesAtomFamily.remove(atomKey);
  choicesHiddenAtomFamily.remove(atomKey);
}
//# sourceMappingURL=choiceManager.js.map
