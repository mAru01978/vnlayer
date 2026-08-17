// 背景(#s:bg)を管理するマネージャー。
//
// setBackground()は#s:bgタグから呼ばれる「本来の」書き込み経路で、
// autoHideOnBgChange(場面転換時に吹き出しを自動で消す設定)の判定込み。
// この判定はtags/uiConfig.tsの実効設定(instanceIdスコープ、未指定=グローバル)
// を見るため、atomKey(状態の隔離キー)とは別にinstanceId(公開スコープ
// 識別子)も受け取る。
//
// restoreBackground()はcore/useStoryEngine.ts側がinkStepRunner.tsの
// 蓄積スナップショット(result.visual.bg)と状態を同期させるためだけに使う
// 「素の」書き込みで、autoHideOnBgChangeの判定は行わない
// (以前の実装でも、advance()末尾の同期用setBg(...)はhandlers.setBg()を
// 経由しない直接呼び出しで、同様に判定をスキップしていた。挙動を変えない
// ためにこの区別を維持している)。
import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { getStore } from "../store";
import { getUiConfig } from "../../tags/uiConfig";
import * as messageManager from "./messageManager";
export const bgAtomFamily = atomFamily((_atomKey) => atom(""));
export const bgZIndexAtomFamily = atomFamily((_atomKey) => atom(undefined));
export function setBackground(atomKey, instanceId, name) {
    const store = getStore();
    const target = bgAtomFamily(atomKey);
    const changed = store.get(target) !== name;
    store.set(target, name);
    if (changed && getUiConfig(instanceId).messageWindow.autoHideOnBgChange) {
        messageManager.clear(atomKey);
    }
}
// core/useStoryEngine.tsのadvance()末尾、ink側の蓄積スナップショットとの
// 同期専用。autoHideOnBgChangeの判定はしない(上記コメント参照)。
export function restoreBackground(atomKey, name) {
    getStore().set(bgAtomFamily(atomKey), name);
}
export function getBackground(atomKey) {
    return getStore().get(bgAtomFamily(atomKey));
}
export function reset(atomKey) {
    getStore().set(bgAtomFamily(atomKey), "");
    getStore().set(bgZIndexAtomFamily(atomKey), undefined);
}
export function dispose(atomKey) {
    bgAtomFamily.remove(atomKey);
    bgZIndexAtomFamily.remove(atomKey);
}
export function setBackgroundZIndex(atomKey, zIndex) {
    getStore().set(bgZIndexAtomFamily(atomKey), zIndex);
}
export function getBackgroundZIndex(atomKey) {
    return getStore().get(bgZIndexAtomFamily(atomKey));
}
//# sourceMappingURL=backgroundManager.js.map