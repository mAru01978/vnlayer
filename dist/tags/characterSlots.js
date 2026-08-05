// 画像がまだない段階の「立ち位置」データの置き場所。
// 以前はtagConfig.tsがdata/characterSlots.jsonを直接静的importしていたが、
// それだと静的バンドル(vnlayer.js)側からは差し替えられないため、
// 実行時に注入する形に変えた。
//
// Next.js運用: context/StoryContext.tsx が起動時に1回 setCharacterSlots(json) する。
// 静的運用: VNLayer.configure({ characterSlots: {...} }) で注入する。
let slots = {};
export function setCharacterSlots(next) {
    slots = { ...slots, ...next };
}
export function getCharacterSlot(name) {
    return slots[name];
}
export function getAllCharacterSlots() {
    return slots;
}
//# sourceMappingURL=characterSlots.js.map