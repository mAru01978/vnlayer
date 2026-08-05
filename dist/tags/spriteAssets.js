// #s(sprite)の静止画(表情ごとの立ち絵)を解決するための素材レジストリ。
// characterSlots.ts(座標)とは別物 — こちらは「何の画像を出すか」だけを扱う。
//
// キーは「キャラ名+表情」の組み合わせ。表情を省略した場合は'normal'として
// 扱う(#s:alice のように表情指定を省略した場合と同じ既定値)。
//
// 未登録のキャラ/表情はcomponents/mockRenderer.tsxが今まで通りの
// モック表示(色付き四角+ラベル)にフォールバックする。
//
// VNLayer.configure({ spriteAssets: { alice: { normal: {src:'...'}, happy: {src:'...'} } } })
// のようにキャラ名→表情→設定のネストしたオブジェクトで登録する(内部では
// tags/assets.tsの汎用レジストリ用に「キャラ名:表情」という合成キーへ
// フラット化して保持している)。
import { createAssetRegistry } from './assets';
const registry = createAssetRegistry();
const DEFAULT_EXPRESSION = 'normal';
function composeKey(characterName, expression) {
    return `${characterName}:${expression}`;
}
export function setSpriteAssets(patch) {
    const flat = {};
    for (const [charName, expressions] of Object.entries(patch)) {
        for (const [expression, config] of Object.entries(expressions)) {
            flat[composeKey(charName, expression)] = config;
        }
    }
    registry.set(flat);
}
// テーブル登録の代わりに、命名規則から機械的にパスを組み立てたい場合用
// (例: `(charName, expression) => ({ src: \`/assets/characters/${charName}/${expression}.webp\` })`)。
export function setSpriteAssetResolver(fn) {
    registry.setResolver((key) => {
        const [charName, expression] = key.split(':');
        return fn(charName, expression);
    });
}
export function getSpriteAsset(characterName, expression) {
    return registry.get(composeKey(characterName, expression ?? DEFAULT_EXPRESSION));
}
export function getAllSpriteAssets() {
    return registry.getAll();
}
//# sourceMappingURL=spriteAssets.js.map