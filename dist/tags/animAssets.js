// #anim(モーション再生)がキャラ+表情+モーション名から「実際に何を表示するか」
// を解決するための素材レジストリ。
//
// scope対応(2.1: configureスコープ統一): tags/scopedStore.tsの共通パターンに
// 乗せた。setAnimAssets(patch, scope?)でselectorを渡すと、そのVN
// インスタンス専用の追加登録として扱われる(グローバル登録はそのまま、
// 他のVNには影響しない)。setAnimAssetResolver()(命名規則から機械的に
// パスを組み立てるカスタムresolver)は現状scope非対応のグローバル関数の
// まま(低頻度APIのため、必要になったら追って対応する)。
//
// 2つの方式に対応する:
//   sequence … 連番画像(webp等)をコマ送りする。手動指定(frames配列)のみ
//              対応(連番の枚数をフォルダ規約から自動検出する仕組みは
//              持たないため — 何らかのマニフェストが無い限り、ブラウザ側
//              から「何枚あるか」を安全に知る方法が無いため)。
//   single   … 1本のアニメーションファイル(webm、透過アルファ対応)を
//              <video>で再生する。手動でsrcを指定するか、未指定なら
//              フォルダ規約(${basePath}/anim/${name}/${motion}.${animExtension})
//              にフォールバックする。
//
// 表情との組み合わせ: 「そのキャラの全表情で共通のモーション」と「特定の
// 表情の時だけ差し替えたいモーション」の両方に対応するため、解決順は
//   1. 完全一致(キャラ+表情+モーション)
//   2. 表情ワイルドカード(キャラ+モーション、表情を問わない)
// の順にフォールバックする。
//
// 登録側のAPI(setAnimAssets)は「キャラ名 → キー → 設定」のネストした形。
// キーは以下のどちらでも書ける:
//   "walk"          → 表情を問わない共通モーション(表情ワイルドカード登録)
//   "happy:walk"    → 表情'happy'の時だけ使う専用モーション
//
// 例(VNLayer.configure({ assets: { anim: {...} } })):
//   {
//     alice: {
//       walk: { mode: 'sequence', frames: ['/a/walk_0.webp', '/a/walk_1.webp'], fps: 12 },
//       'happy:walk': { mode: 'single', src: '/a/walk_happy.webm' },
//       // src省略時はフォルダ規約(${basePath}/anim/alice/walk.webm)にフォールバック:
//       run: { mode: 'single' },
//     },
//   }
//
// 未登録かつフォルダ規約でも見つからない(存在確認自体はしない — ブラウザの
// <video>タグのロードに委ねる)場合は、tags/assetsConfig.tsの
// fallbackToMock設定に従ってモック表示にフォールバックするか、
// AssetErrorを報告して何も描画しない(components/Renderer.tsx参照)。
import { getAssetsConfig, shouldFallbackToMock, getAssetsConfigVersion, } from "./assetsConfig";
import { resolveUrlCached } from "../core/ResourceLoader";
import { createScopedStore } from "./scopedStore";
const EXPRESSION_WILDCARD = "*";
function composeKey(characterName, expression, motion) {
    return `${characterName}:${expression}:${motion}`;
}
const store = createScopedStore({
    defaultValue: {},
    mergePatch: (base, patch) => (patch ? { ...base, ...patch } : base),
    mergePatches: (prev, patch) => ({ ...prev, ...patch }),
});
export function subscribeAnimAssets(listener) {
    return store.subscribe(listener);
}
export function getAnimAssetsVersion() {
    return store.getVersion() + getAssetsConfigVersion();
}
// scope省略時は今まで通りグローバル登録。ink側タグからの呼び出しは無い
// (#animは既存表情/位置の切り替えのみで、素材テーブル自体はJS側からしか
// 登録できない)。
export function setAnimAssets(patch, scope) {
    const flat = {};
    for (const [charName, motions] of Object.entries(patch)) {
        for (const [rawKey, config] of Object.entries(motions)) {
            const parts = rawKey.split(":");
            const [expression, motion] = parts.length > 1
                ? [parts[0], parts[1]]
                : [EXPRESSION_WILDCARD, parts[0]];
            flat[composeKey(charName, expression, motion)] = config;
        }
    }
    store.set(flat, scope);
}
// テーブル登録の代わりに、命名規則から機械的にパスを組み立てたい場合用。
// (グローバルのみ。scope非対応 — ファイル冒頭コメント参照)。
export function setAnimAssetResolver(fn) {
    resolverFn = fn;
    store.notifyChange();
}
let resolverFn;
function conventionAnimPath(name, motion, scope) {
    const { basePath, animExtension } = getAssetsConfig(scope);
    const base = (basePath ?? "./assets").replace(/\/+$/, "");
    return `${base}/anim/${name}/${motion}.${animExtension ?? "webm"}`;
}
export function getAnimAsset(characterName, expression, motion, scope) {
    if (!motion)
        return undefined;
    const exp = expression ?? "normal";
    const registry = store.get(scope);
    const found = registry[composeKey(characterName, exp, motion)] ??
        registry[composeKey(characterName, EXPRESSION_WILDCARD, motion)] ??
        resolverFn?.(characterName, exp, motion);
    if (!found)
        return undefined;
    const globalCfg = getAssetsConfig(scope);
    const source = found.source ?? globalCfg.source ?? "fetch";
    const resolveLocal = found.resolveLocal ?? globalCfg.resolveLocal;
    if (found.mode === "single") {
        if (found.src) {
            if (source === "local") {
                const resolved = resolveUrlCached(`anim:${scope ?? ""}:${characterName}:${motion}:single`, found.src, { source, resolveLocal }, store.notifyChange);
                return { mode: "single", src: resolved };
            }
            return found;
        }
        // src未指定: source:'local'ではフォルダ規約フォールバックは使わない
        // (非同期解決の前提が崩れるため、手動指定を推奨)。
        if (source === "local")
            return { mode: "single", src: undefined };
        return {
            mode: "single",
            src: conventionAnimPath(characterName, motion, scope),
        };
    }
    // mode:'sequence'。各フレームがsource:'local'ならキャッシュ経由で解決する。
    // 1枚でも未解決ならこのタイミングではフレーム全体をundefinedのまま返さず、
    // 解決済みの分だけ反映した配列を返す(全部揃うまで表示を止めたくないため。
    // 未解決フレームは直前のキャッシュ値かundefinedのままになる)。
    if (source === "local") {
        const resolvedFrames = found.frames.map((frame, i) => resolveUrlCached(`anim:${scope ?? ""}:${characterName}:${motion}:seq:${i}`, frame, { source, resolveLocal }, store.notifyChange));
        if (resolvedFrames.some((f) => f === undefined)) {
            // まだ全フレーム解決していない: 解決済みの範囲だけでも使えるよう
            // フィルタして返す(空でも呼び出し側でframes.length===0を弾く)。
            return {
                mode: "sequence",
                frames: resolvedFrames.filter((f) => Boolean(f)),
                fps: found.fps,
            };
        }
        return {
            mode: "sequence",
            frames: resolvedFrames,
            fps: found.fps,
        };
    }
    return found;
}
export function getAllAnimAssets(scope) {
    return store.get(scope);
}
export function shouldFallbackForAnim(name, motion, scope) {
    return shouldFallbackToMock(`anim "${name}:${motion}"`, scope);
}
//# sourceMappingURL=animAssets.js.map