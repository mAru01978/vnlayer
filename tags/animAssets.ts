// #anim(モーション再生)がキャラ+表情+モーション名から「実際に何を表示するか」
// を解決するための素材レジストリ。
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
import {
  getAssetsConfig,
  shouldFallbackToMock,
  getAssetsConfigVersion,
} from "./assetsConfig";
import { resolveUrlCached, type ResourceSource } from "../core/ResourceLoader";

export type AnimAssetConfig =
  | {
      mode: "sequence";
      frames: string[];
      fps?: number;
      source?: ResourceSource;
      resolveLocal?: (path: string) => Promise<unknown>;
    }
  | {
      mode: "single";
      src?: string;
      source?: ResourceSource;
      resolveLocal?: (path: string) => Promise<unknown>;
    };

const registry = new Map<string, AnimAssetConfig>();

const EXPRESSION_WILDCARD = "*";

function composeKey(
  characterName: string,
  expression: string,
  motion: string,
): string {
  return `${characterName}:${expression}:${motion}`;
}

let version = 0;
const listeners = new Set<() => void>();
function bumpVersion(): void {
  version += 1;
  listeners.forEach((l) => l());
}
export function subscribeAnimAssets(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getAnimAssetsVersion(): number {
  return version + getAssetsConfigVersion();
}

export function setAnimAssets(
  patch: Record<string, Record<string, AnimAssetConfig>>,
): void {
  const flat: Record<string, AnimAssetConfig> = {};
  for (const [charName, motions] of Object.entries(patch)) {
    for (const [rawKey, config] of Object.entries(motions)) {
      const parts = rawKey.split(":");
      const [expression, motion] =
        parts.length > 1
          ? [parts[0], parts[1]]
          : [EXPRESSION_WILDCARD, parts[0]];
      flat[composeKey(charName, expression, motion)] = config;
    }
  }
  for (const [key, value] of Object.entries(flat)) {
    registry.set(key, value);
  }
  bumpVersion();
}

// テーブル登録の代わりに、命名規則から機械的にパスを組み立てたい場合用。
export function setAnimAssetResolver(
  fn: (
    characterName: string,
    expression: string,
    motion: string,
  ) => AnimAssetConfig | undefined,
): void {
  resolverFn = fn;
  bumpVersion();
}
let resolverFn:
  | ((
      characterName: string,
      expression: string,
      motion: string,
    ) => AnimAssetConfig | undefined)
  | undefined;

function conventionAnimPath(name: string, motion: string): string {
  const { basePath, animExtension } = getAssetsConfig();
  const base = (basePath ?? "./assets").replace(/\/+$/, "");
  return `${base}/anim/${name}/${motion}.${animExtension ?? "webm"}`;
}

export function getAnimAsset(
  characterName: string,
  expression: string | undefined,
  motion: string | undefined,
): AnimAssetConfig | undefined {
  if (!motion) return undefined;
  const exp = expression ?? "normal";
  const found =
    registry.get(composeKey(characterName, exp, motion)) ??
    registry.get(composeKey(characterName, EXPRESSION_WILDCARD, motion)) ??
    resolverFn?.(characterName, exp, motion);

  if (!found) return undefined;

  const globalCfg = getAssetsConfig();
  const source = found.source ?? globalCfg.source ?? "fetch";
  const resolveLocal = found.resolveLocal ?? globalCfg.resolveLocal;

  if (found.mode === "single") {
    if (found.src) {
      if (source === "local") {
        const resolved = resolveUrlCached(
          `anim:${characterName}:${motion}:single`,
          found.src,
          { source, resolveLocal },
          bumpVersion,
        );
        return { mode: "single", src: resolved };
      }
      return found;
    }
    // src未指定: source:'local'ではフォルダ規約フォールバックは使わない
    // (非同期解決の前提が崩れるため、手動指定を推奨)。
    if (source === "local") return { mode: "single", src: undefined };
    return { mode: "single", src: conventionAnimPath(characterName, motion) };
  }

  // mode:'sequence'。各フレームがsource:'local'ならキャッシュ経由で解決する。
  // 1枚でも未解決ならこのタイミングではフレーム全体をundefinedのまま返さず、
  // 解決済みの分だけ反映した配列を返す(全部揃うまで表示を止めたくないため。
  // 未解決フレームは直前のキャッシュ値かundefinedのままになる)。
  if (source === "local") {
    const resolvedFrames = found.frames.map((frame, i) =>
      resolveUrlCached(
        `anim:${characterName}:${motion}:seq:${i}`,
        frame,
        { source, resolveLocal },
        bumpVersion,
      ),
    );
    if (resolvedFrames.some((f) => f === undefined)) {
      // まだ全フレーム解決していない: 解決済みの範囲だけでも使えるよう
      // フィルタして返す(空でも呼び出し側でframes.length===0を弾く)。
      return {
        mode: "sequence",
        frames: resolvedFrames.filter((f): f is string => Boolean(f)),
        fps: found.fps,
      };
    }
    return {
      mode: "sequence",
      frames: resolvedFrames as string[],
      fps: found.fps,
    };
  }

  return found;
}

export function getAllAnimAssets(): Record<string, AnimAssetConfig> {
  return Object.fromEntries(registry);
}

export function shouldFallbackForAnim(name: string, motion: string): boolean {
  return shouldFallbackToMock(`anim "${name}:${motion}"`);
}
