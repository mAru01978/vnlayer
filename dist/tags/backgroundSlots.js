// 画像がまだない段階の「背景の見た目」データの置き場所。characterSlots.tsと
// 完全に同じパターン: 実行時にJS(VNLayer.configure({ backgroundSlots: {...} }))
// からも、Ink(#bg:name:color:...タグ)からも同じsetBackgroundSlots()を共有し、
// 後から書いた方が勝つ(優先度判定は無い)。
//
// これにより、characterSlots.json/backgroundSlots.jsonのどちらも注入しなくても、
// ink側だけで最低限の見た目(座標・色)を完結させられる
// (# sprite:alice:initPos:30:55 、 # bg:name:color:#f3e3c8 等)。
let slots = {};
export function setBackgroundSlots(next) {
    slots = { ...slots, ...next };
}
export function getBackgroundSlot(name) {
    return slots[name];
}
export function getAllBackgroundSlots() {
    return slots;
}
//# sourceMappingURL=backgroundSlots.js.map