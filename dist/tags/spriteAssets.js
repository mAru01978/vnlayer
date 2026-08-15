// 素材統合(2026-08-09): 以前は characterSlots.ts(立ち位置) /
// backgroundSlots.ts(背景の色・画像) / spriteAssets.ts(表情ごとの静止画)の
// 3つに分かれていたレジストリを、1つの「Sprite(静止画系全般 — キャラの
// 表情立ち絵も背景も含む)」レジストリに統合した。
// #bgが#s:bgへ統合された(tags/defs/special/sprite.ts参照)のと同じ理由で、
// 「背景も1枚の静止画を切り替えているだけ」という点でキャラの表情画像と
// 本質的に同じ仕組みとして扱う。
//
// 登録形式: VNLayer.configure({ assets: { sprite: {
//   alice: { originX: 30, originY: 55, variants: { normal: {src:'...'}, happy: {src:'...'} } },
//   bg:    { variants: { izakaya_main_day: { color: '#f3e3c8' }, izakaya_main_night: { src: '...' } } },
// } } })
// 「bg」は#sprite側と同じ予約済み疑似キャラ名(立ち位置originX/originYは
// 持たない)。variantsのキーはキャラなら表情名、bgなら背景名。
//
// 画像の解決優先順位: (1)手動指定のsrc → (2)フォルダ規約
// (${basePath}/sprite/${name}/${variant}.${spriteExtension}) →
// (3)fallbackToMockがtrueならモック表示、falseならAssetErrorを報告して
// 何も描画しない(components/Renderer.tsx参照)。
import { getAssetsConfig, shouldFallbackToMock, getAssetsConfigVersion, } from "./assetsConfig";
import { resolveUrlCached } from "../core/ResourceLoader";
const BG_PSEUDO_NAME = "bg";
const registry = new Map();
let version = 0;
const listeners = new Set();
function bumpVersion() {
    version += 1;
    listeners.forEach((l) => l());
}
export function subscribeSpriteAssets(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
export function getSpriteAssetsVersion() {
    // assetsConfig(basePath/source等)が変わってもsrc解決結果が変わりうるため、
    // 2つのversionを合算して1つの購読対象として扱えるようにしておく
    // (components/Renderer.tsx側はこちらだけ購読すればよい)。
    return version + getAssetsConfigVersion();
}
// VNLayer.configure({ assets: { sprite: {...} } }) / # s:name:initPos:... /
// # s:bg:name:color:... から呼ばれる。深いマージ(variants同士も合成)。
export function setSpriteAssets(patch) {
    for (const [name, cfg] of Object.entries(patch)) {
        const existing = registry.get(name) ?? {};
        registry.set(name, {
            originX: cfg.originX ?? existing.originX,
            originY: cfg.originY ?? existing.originY,
            variants: { ...existing.variants, ...cfg.variants },
        });
    }
    bumpVersion();
}
export function getCharacterSlot(name) {
    const cfg = registry.get(name);
    if (!cfg || cfg.originX === undefined || cfg.originY === undefined)
        return undefined;
    return { originX: cfg.originX, originY: cfg.originY };
}
export function getAllCharacterSlots() {
    const result = {};
    for (const [name, cfg] of registry.entries()) {
        if (name === BG_PSEUDO_NAME)
            continue;
        if (cfg.originX !== undefined && cfg.originY !== undefined) {
            result[name] = { originX: cfg.originX, originY: cfg.originY };
        }
    }
    return result;
}
export function getBackgroundSlot(bgName) {
    const variant = registry.get(BG_PSEUDO_NAME)?.variants?.[bgName];
    if (!variant)
        return undefined;
    return {
        color: variant.color,
        image: resolveSpriteSrc(BG_PSEUDO_NAME, bgName) ?? variant.src,
    };
}
export function getAllBackgroundSlots() {
    const variants = registry.get(BG_PSEUDO_NAME)?.variants ?? {};
    const result = {};
    for (const [bgName, v] of Object.entries(variants)) {
        result[bgName] = { color: v.color, image: v.src };
    }
    return result;
}
// フォルダ規約でのパス組み立て(存在確認はしない — ブラウザの<img>/<video>
// タグ自体のロードに委ねる。source:'local'の場合はresolveUrl側で
// resolveLocalを呼ぶ必要があるため、ここでは同期的な'fetch'前提の
// パス文字列だけを返す簡易版。source:'local'を使う場合は手動でsrcを
// 指定することを推奨する — 非同期解決が必要なため)。
function conventionSpritePath(name, variant) {
    const { basePath, spriteExtension } = getAssetsConfig();
    const base = (basePath ?? "./assets").replace(/\/+$/, "");
    return `${base}/sprite/${name}/${variant}.${spriteExtension ?? "png"}`;
}
// 表情/背景画像の解決(手動指定優先 → フォルダ規約)。
// source(取得方法)の優先順位は「その素材自身のsource指定 > グローバル
// (VNLayer.configure({assets:{source:...}}))」。
//   - source:'fetch'(既定) … 手動srcはそのままURLとして使う。
//   - source:'local'        … 手動srcを"path"として扱い、resolveLocal()
//                              (その素材自身のresolveLocal、無ければ
//                              グローバルのresolveLocal)で非同期に解決する
//                              (core/ResourceLoader.tsのキャッシュ経由)。
//                              未解決の間はundefinedを返し、解決でき次第
//                              version更新→再描画で反映される。
//                              フォルダ規約フォールバックはsource:'local'
//                              では使わない(非同期解決が前提のため、
//                              未登録の場合は手動でsrcを指定すること)。
export function resolveSpriteSrc(name, variant) {
    const entry = registry.get(name)?.variants?.[variant];
    const manual = entry?.src;
    const globalCfg = getAssetsConfig();
    const source = entry?.source ?? globalCfg.source ?? "fetch";
    const resolveLocal = entry?.resolveLocal ?? globalCfg.resolveLocal;
    // 修正メモ(2026-08-13、「モックが出ず壊れた画像が出る」不具合の修正):
    // nameそのものが一度も登録されていない(=このキャラ/背景を
    // VNLayer.configure()等で一度も設定していない)場合は、規約パスを
    // 推測せずundefinedを返す。以前はここで無条件にconventionSpritePath()
    // を返していたため、一度も登録していない未知の名前に対しても推測URLが
    // 生成され、components/Renderer.tsx側の`hasRealAsset`判定が常にtrueに
    // なり(3)のfallbackToMock判定に一切到達しない結果、fallbackToMock:true
    // を設定していても常に「壊れた画像」が優先されてしまっていた。
    const characterCfg = registry.get(name);
    if (!characterCfg)
        return undefined;
    if (manual) {
        if (source === "local") {
            return resolveUrlCached(`sprite:${name}:${variant}`, manual, { source, resolveLocal }, bumpVersion);
        }
        return manual;
    }
    if (source === "local")
        return undefined;
    return conventionSpritePath(name, variant);
}
// components/Renderer.tsx用: 表情画像が実在しない場合にモックへ
// フォールバックしてよいかどうか。
export function shouldFallbackForSprite(name, variant) {
    return shouldFallbackToMock(`sprite "${name}:${variant}"`);
}
//# sourceMappingURL=spriteAssets.js.map