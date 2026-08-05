// タイプライター演出(#type)の速度・読み終わり待ちモードを管理するマネージャー。
//
// typeSpeedはタグシステム大改修フェーズ1で既にcore/atoms.tsのatomFamilyに
// なっている(#type:slow のような速度指定はそちらに直接書き込む、basicタグ
// 相当の単純さのため)。ここではそれに加え、#type:wait:on/off が切り替える
// 「読み終わり待ち」の有効/バッファ時間を管理する。
//
// 以前はcore/useStoryEngine.ts内のuseRef(typeWaitEnabledRef/
// typeWaitBufferRef)で持っていたが、Reactの再描画には使わない(advance()の
// 内部タイミング計算専用)値なので、こちらもMapで十分。
import { getStore } from "../store";
import { typeSpeedAtomFamily } from "../atoms";
const typeWaitEnabled = new Map();
const typeWaitBuffer = new Map();
export function setTypeSpeed(atomKey, ms) {
    getStore().set(typeSpeedAtomFamily(atomKey), ms);
}
export function getTypeSpeed(atomKey) {
    return getStore().get(typeSpeedAtomFamily(atomKey));
}
export function setTypeWaitMode(atomKey, enabled, readingBufferMs) {
    typeWaitEnabled.set(atomKey, enabled);
    if (readingBufferMs !== undefined)
        typeWaitBuffer.set(atomKey, readingBufferMs);
}
export function isTypeWaitEnabled(atomKey) {
    return typeWaitEnabled.get(atomKey) ?? false;
}
export function getTypeWaitBufferMs(atomKey) {
    return typeWaitBuffer.get(atomKey) ?? 1500;
}
export function reset(atomKey) {
    typeWaitEnabled.delete(atomKey);
    typeWaitBuffer.delete(atomKey);
}
export function dispose(atomKey) {
    typeWaitEnabled.delete(atomKey);
    typeWaitBuffer.delete(atomKey);
    typeSpeedAtomFamily.remove(atomKey);
}
//# sourceMappingURL=typeManager.js.map