// 素材統合(2026-08-09): 以前は characterSlots.ts(立ち位置) /
// backgroundSlots.ts(背景の色・画像) / spriteAssets.ts(表情ごとの静止画)の
// 3つに分かれていたレジストリを、1つの「Sprite(静止画系全般 — キャラの
// 表情立ち絵も背景も含む)」レジストリに統合した。
//
// scope対応(2.1: configureスコープ統一): tags/scopedStore.tsの共通パターンに
// 乗せた。setSpriteAssets(patch, scope?)でselectorを渡すと、そのVN
// インスタンス専用の追加登録として扱われる(グローバル登録はそのまま、
// 他のVNには影響しない)。getCharacterSlot/getBackgroundSlot/resolveSpriteSrc
// 等の読み出し側も同様にscopeを受け取れる(省略時は今まで通りグローバル
// のみを見る)。
//
// 重要: ink側のタグ(# s:name:initPos:.../# s:bg:name:color:...)からの登録
// は、このscope機構の対象外で意図的にグローバル固定のまま(tags/defs/
// special/sprite.ts側もsetSpriteAssets()にscopeを渡さない)。これは
// 「同じキャラ/背景定義を複数のVNインスタンス間で共有できる」という以前
// からの設計を壊さないための判断。VNLayer.configure({assets:{sprite:{...}}},
// selector)のようにJS側から明示的にselectorを渡した場合だけ、そのVN専用の
// 上書きになる。
//
// 登録形式: VNLayer.configure({ assets: { sprite: {
//   alice: { originX: 30, originY: 55, variants: { normal: {src:'...'}, happy: {src:'...'} } },
//   bg:    { variants: { izakaya_main_day: { color: '#f3e3c8' }, izakaya_main_night: { src: '...' } } },
// } } }, selector?)
// 「bg」は#sprite側と同じ予約済み疑似キャラ名(立ち位置originX/originYは
// 持たない)。variantsのキーはキャラなら表情名、bgなら背景名。
//
// 画像の解決優先順位: (1)手動指定のsrc → (2)フォルダ規約
// (${basePath}/sprite/${name}/${variant}.${spriteExtension}) →
// (3)fallbackToMockがtrueならモック表示、falseならAssetErrorを報告して
// 何も描画しない(components/Renderer.tsx参照)。
import {
  getAssetsConfig,
  shouldFallbackToMock,
  getAssetsConfigVersion,
} from "./assetsConfig";
import { resolveUrlCached, type ResourceSource } from "../core/ResourceLoader";
import { createScopedStore } from "./scopedStore";

export type SpriteVariantConfig = {
  src?: string;
  color?: string;
  // このsrc1つだけについて、グローバル設定(VNLayer.configure({assets:{source:...}}))
  // より優先して取得方法を指定したい場合に使う。未指定ならグローバル設定に従う。
  source?: ResourceSource;
  resolveLocal?: (path: string) => Promise<unknown>;
};
export type SpriteCharacterConfig = {
  originX?: number;
  originY?: number;
  variants?: Record<string, SpriteVariantConfig>;
};

const BG_PSEUDO_NAME = "bg";

type SpriteRegistry = Record<string, SpriteCharacterConfig>;

// 深いマージ(variants同士も合成)。tags/scopedStore.tsの
// mergePatch/mergePatches両方から、同じロジックとして使う
// (mergePatchは「グローバル値+scope patch」、mergePatchesは「同じscopeへの
// 複数回set」という別の合成方向だが、どちらも「既存レジストリへ1つの
// patchを重ねる」という同じ操作)。
function mergeRegistryPatch(
  base: SpriteRegistry,
  patch: SpriteRegistry | undefined,
): SpriteRegistry {
  if (!patch) return base;
  const result: SpriteRegistry = { ...base };
  for (const [name, cfg] of Object.entries(patch)) {
    const existing = result[name] ?? {};
    result[name] = {
      originX: cfg.originX ?? existing.originX,
      originY: cfg.originY ?? existing.originY,
      variants: { ...existing.variants, ...cfg.variants },
    };
  }
  return result;
}

const store = createScopedStore<SpriteRegistry, SpriteRegistry>({
  defaultValue: {},
  mergePatch: mergeRegistryPatch,
  mergePatches: (prev, patch) => mergeRegistryPatch(prev ?? {}, patch),
});

export function subscribeSpriteAssets(listener: () => void): () => void {
  return store.subscribe(listener);
}
export function getSpriteAssetsVersion(): number {
  // assetsConfig(basePath/source等)が変わってもsrc解決結果が変わりうるため、
  // 2つのversionを合算して1つの購読対象として扱えるようにしておく
  // (components/Renderer.tsx側はこちらだけ購読すればよい)。
  return store.getVersion() + getAssetsConfigVersion();
}

// VNLayer.configure({ assets: { sprite: {...} } }, selector?) /
// # s:name:initPos:... / # s:bg:name:color:... から呼ばれる
// (ink側タグからの呼び出しは常にscope省略=グローバル。上記コメント参照)。
export function setSpriteAssets(
  patch: Record<string, SpriteCharacterConfig>,
  scope?: string,
): void {
  store.set(patch, scope);
}

export function getCharacterSlot(
  name: string,
  scope?: string,
): { originX: number; originY: number } | undefined {
  const cfg = store.get(scope)[name];
  if (!cfg || cfg.originX === undefined || cfg.originY === undefined)
    return undefined;
  return { originX: cfg.originX, originY: cfg.originY };
}

export function getAllCharacterSlots(
  scope?: string,
): Record<string, { originX: number; originY: number }> {
  const result: Record<string, { originX: number; originY: number }> = {};
  for (const [name, cfg] of Object.entries(store.get(scope))) {
    if (name === BG_PSEUDO_NAME) continue;
    if (cfg.originX !== undefined && cfg.originY !== undefined) {
      result[name] = { originX: cfg.originX, originY: cfg.originY };
    }
  }
  return result;
}

export function getBackgroundSlot(
  bgName: string,
  scope?: string,
): { color?: string; image?: string } | undefined {
  const variant = store.get(scope)[BG_PSEUDO_NAME]?.variants?.[bgName];
  if (!variant) return undefined;
  return {
    color: variant.color,
    image: resolveSpriteSrc(BG_PSEUDO_NAME, bgName, scope) ?? variant.src,
  };
}

export function getAllBackgroundSlots(
  scope?: string,
): Record<string, { color?: string; image?: string }> {
  const variants = store.get(scope)[BG_PSEUDO_NAME]?.variants ?? {};
  const result: Record<string, { color?: string; image?: string }> = {};
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
function conventionSpritePath(
  name: string,
  variant: string,
  scope?: string,
): string {
  const { basePath, spriteExtension } = getAssetsConfig(scope);
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
export function resolveSpriteSrc(
  name: string,
  variant: string,
  scope?: string,
): string | undefined {
  const registry = store.get(scope);
  const entry = registry[name]?.variants?.[variant];
  const manual = entry?.src;
  const globalCfg = getAssetsConfig(scope);
  const source = entry?.source ?? globalCfg.source ?? "fetch";
  const resolveLocal = entry?.resolveLocal ?? globalCfg.resolveLocal;

  if (manual) {
    if (source === "local") {
      return resolveUrlCached(
        `sprite:${scope ?? ""}:${name}:${variant}`,
        manual,
        { source, resolveLocal },
        store.notifyChange,
      );
    }
    return manual;
  }

  // 修正メモ(2026-08-13、「モックが出ず壊れた画像が出る」不具合の修正):
  // nameそのものが一度も登録されていない(=このキャラ/背景を
  // VNLayer.configure()等で一度も設定していない)場合は、規約パスを
  // 推測せずundefinedを返す。以前はここで無条件にconventionSpritePath()
  // を返していたため、一度も登録していない未知の名前に対しても推測URLが
  // 生成され、components/Renderer.tsx側の`hasRealAsset`判定が常にtrueに
  // なり(3)のfallbackToMock判定に一切到達しない結果、fallbackToMock:true
  // を設定していても常に「壊れた画像」が優先されてしまっていた。
  const characterCfg = registry[name];
  if (!characterCfg) return undefined;

  if (source === "local") return undefined;
  return conventionSpritePath(name, variant, scope);
}

// components/Renderer.tsx用: 表情画像が実在しない場合にモックへ
// フォールバックしてよいかどうか。
export function shouldFallbackForSprite(
  name: string,
  variant: string,
  scope?: string,
): boolean {
  return shouldFallbackToMock(`sprite "${name}:${variant}"`, scope);
}
