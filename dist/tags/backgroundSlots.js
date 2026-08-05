// #bg:name が実際に何を表示するかを解決するための素材レジストリ。
// 画像がまだ無い段階の「色」だけの運用と、実際の背景画像を使う運用の
// 両方に対応する(色・画像どちらも設定可能。画像があればそちらを優先する
// 判断はcomponents/mockRenderer.tsx側で行う)。
//
// tags/assets.tsの汎用レジストリ経由にした(以前は素朴なRecord+関数だった)。
// 挙動は変わらない(後から書いた方が勝つ、名前ごとの完全上書き)が、
// setBackgroundResolver()で命名規則からの機械的な解決にも対応できるように
// 拡張してある。
//
// JS(VNLayer.configure({ backgroundSlots: {...} }))からも、Ink
// (#bg:name:color:...タグ)からも同じsetBackgroundSlots()を共有し、
// 後から書いた方が勝つ(優先度判定は無い)。
//
// これにより、backgroundSlots.jsonを注入しなくても、ink側だけで最低限の
// 見た目(色)を完結させられる(# bg:name:color:#f3e3c8 等)。
import { createAssetRegistry } from './assets';
const registry = createAssetRegistry();
export function setBackgroundSlots(next) {
    registry.set(next);
}
// テーブル登録の代わりに、命名規則から機械的にパスを組み立てたい場合用
// (例: `(name) => ({ image: \`/assets/backgrounds/${name}.webp\` })`)。
export function setBackgroundResolver(fn) {
    registry.setResolver(fn);
}
export function getBackgroundSlot(name) {
    return registry.get(name);
}
export function getAllBackgroundSlots() {
    return registry.getAll();
}
//# sourceMappingURL=backgroundSlots.js.map