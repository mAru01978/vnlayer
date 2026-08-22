// VNLayer.configure({ assets: {...} }, selector?) のうち、sprite/anim共通の
// 設定(ベースパス・取得方法・フォールバック可否)を持つストア。
//
// scope対応(2.1: configureスコープ統一): tags/scopedStore.tsの共通パターンに
// 乗せた。selectorを省略した場合は今まで通りグローバル設定として働き、
// selectorを渡すとそのVNインスタンスだけの上書きになる(グローバル設定は
// そのまま、他のVNには影響しない)。
//
// fallbackToMock(既定false): sprite/anim素材が未登録/未検出の場合に
// モック表示(色付き四角+ラベル)へフォールバックするかどうか。
// falseの場合、未検出はAssetError(core/errors.ts)として報告され、
// 見た目は何も描画しない(開発中に「素材の指定漏れ」に気づけるようにする
// ための既定値)。開発中に見た目を仮確認したい場合だけ、
// VNLayer.configure({ assets: { fallbackToMock: true } }) で明示的にonにする。
import { reportError, AssetError } from "../core/errors";
import type { ResourceSource } from "../core/ResourceLoader";
import { createScopedStore } from "./scopedStore";

const reportedMissingAssets = new Set<string>();

export type AssetsGlobalConfig = {
  // 素材配信のベースパス(story.jsonのdataBaseUrlとは別物)。
  // 例: "/assets" なら "/assets/sprite/alice/happy.png" のように解決する。
  basePath?: string;
  // 素材の取得方法。既定は'fetch'。
  source?: ResourceSource;
  // source:'local'の時に必須(core/ResourceLoader.ts参照)。
  resolveLocal?: (path: string) => Promise<unknown>;
  fallbackToMock?: boolean;
  // フォルダ規約で解決する際の既定拡張子(sprite用画像)。
  spriteExtension?: string;
  // フォルダ規約で解決する際の既定拡張子(anim単一動画用)。
  animExtension?: string;
};

const defaultConfig: AssetsGlobalConfig = {
  basePath: "./assets",
  source: "fetch",
  fallbackToMock: false,
  spriteExtension: "png",
  animExtension: "webm",
};

const store = createScopedStore<AssetsGlobalConfig, AssetsGlobalConfig>({
  defaultValue: defaultConfig,
  mergePatch: (base, patch) => (patch ? { ...base, ...patch } : base),
  mergePatches: (prev, patch) => ({ ...prev, ...patch }),
});

export function subscribeAssetsConfig(listener: () => void): () => void {
  return store.subscribe(listener);
}
export function getAssetsConfigVersion(): number {
  return store.getVersion();
}

export function setAssetsConfig(
  patch: AssetsGlobalConfig,
  scope?: string,
): void {
  store.set(patch, scope);
}

export function getAssetsConfig(scope?: string): AssetsGlobalConfig {
  return store.get(scope);
}

// 簡易セーブ機能(core/SaveProvider.ts)用に将来使う可能性があるため、
// uiConfig.tsと同じ形で公開しておく(現状SaveData型には未追加。assets設定は
// 通常セッション中に動的変化しない想定のため、必要になったタイミングで
// core/SaveProvider.tsのSaveData型に足せばよい)。
export function getAllAssetsConfigPatches(): Record<
  string,
  AssetsGlobalConfig
> {
  return store.getAllPatches();
}
export function restoreAssetsConfigPatches(
  patches: Record<string, AssetsGlobalConfig> | undefined,
): void {
  store.restorePatches(patches);
}

// 素材が見つからない場合の共通報告口。fallbackToMockがtrueならモック表示
// してよいのでtrueを返す。falseならAssetErrorを報告してfalseを返す
// (呼び出し側=components/Renderer.tsxはこのfalseを見て何も描画しない)。
// scopeはfallbackToMock自体の実効値解決、および「同じcontextでもscope違いは
// 別々に1回ずつ報告する」ための重複排除キーの両方に使う。
export function shouldFallbackToMock(context: string, scope?: string): boolean {
  const current = getAssetsConfig(scope);
  if (current.fallbackToMock) return true;

  const dedupeKey = scope ? `${scope}::${context}` : context;
  if (!reportedMissingAssets.has(dedupeKey)) {
    reportedMissingAssets.add(dedupeKey);

    reportError(
      new AssetError(`asset not found and fallbackToMock is off: ${context}`),
    );
  }

  return false;
}
