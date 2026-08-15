// VNLayer.configure({ assets: {...} }) のうち、sprite/anim共通の設定
// (ベースパス・取得方法・フォールバック可否)を持つストア。
//
// fallbackToMock(既定false): sprite/anim素材が未登録/未検出の場合に
// モック表示(色付き四角+ラベル)へフォールバックするかどうか。
// falseの場合、未検出はAssetError(core/errors.ts)として報告され、
// 見た目は何も描画しない(開発中に「素材の指定漏れ」に気づけるようにする
// ための既定値)。開発中に見た目を仮確認したい場合だけ、
// VNLayer.configure({ assets: { fallbackToMock: true } }) で明示的にonにする。
import { reportError, AssetError } from '../core/errors';
import type { ResourceSource } from '../core/ResourceLoader';

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
  basePath: './assets',
  source: 'fetch',
  fallbackToMock: false,
  spriteExtension: 'png',
  animExtension: 'webm',
};

let current: AssetsGlobalConfig = { ...defaultConfig };

let version = 0;
const listeners = new Set<() => void>();
function bumpVersion(): void {
  version += 1;
  listeners.forEach((l) => l());
}
export function subscribeAssetsConfig(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getAssetsConfigVersion(): number {
  return version;
}

export function setAssetsConfig(patch: AssetsGlobalConfig): void {
  current = { ...current, ...patch };
  bumpVersion();
}

export function getAssetsConfig(): AssetsGlobalConfig {
  return current;
}

// 素材が見つからない場合の共通報告口。fallbackToMockがtrueならモック表示
// してよいのでtrueを返す。falseならAssetErrorを報告してfalseを返す
// (呼び出し側=components/Renderer.tsxはこのfalseを見て何も描画しない)。
export function shouldFallbackToMock(context: string): boolean {
  if (current.fallbackToMock) return true;
  reportError(new AssetError(`asset not found and fallbackToMock is off: ${context}`));
  return false;
}
