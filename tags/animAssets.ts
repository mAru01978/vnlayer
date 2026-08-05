// #anim(モーション再生)がキャラ+表情+モーション名から「実際に何を表示するか」
// を解決するための素材レジストリ。tags/assets.tsの汎用レジストリを使う。
//
// 2つの方式に対応する:
//   sequence … 連番画像(webp等)をコマ送りする。素材が揃う前や、動作確認を
//              手軽にしたいテスト用途向け(1枚1枚が個別ファイルなので
//              差し替えが楽)。
//   single   … 1本のアニメーションファイル(webm、透過アルファ対応)を
//              <video>で再生する。本番向け。アニメーションwebp/GIFはブラウザの
//              <video>で直接安定して扱えないため、事前に
//              scripts/convert-anim-webp-to-webm.js でwebpから変換した
//              webmを指す想定。
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
// 例:
//   VNLayer.configure({
//     animAssets: {
//       alice: {
//         walk: { mode: 'sequence', frames: ['/a/walk_0.webp', '/a/walk_1.webp'], fps: 12 },
//         'happy:walk': { mode: 'single', src: '/a/walk_happy.webm' },
//       },
//     },
//   });
//
// 未登録のキャラ/モーションはcomponents/mockRenderer.tsxが今まで通りの
// モック表示(色付き四角+ラベル、または登録済みならsprite静止画)に
// フォールバックする。
import { createAssetRegistry } from './assets';

export type AnimAssetConfig =
  | { mode: 'sequence'; frames: string[]; fps?: number }
  | { mode: 'single'; src: string };

const registry = createAssetRegistry<AnimAssetConfig>();

const EXPRESSION_WILDCARD = '*';

function composeKey(characterName: string, expression: string, motion: string): string {
  return `${characterName}:${expression}:${motion}`;
}

export function setAnimAssets(patch: Record<string, Record<string, AnimAssetConfig>>): void {
  const flat: Record<string, AnimAssetConfig> = {};
  for (const [charName, motions] of Object.entries(patch)) {
    for (const [rawKey, config] of Object.entries(motions)) {
      const parts = rawKey.split(':');
      const [expression, motion] = parts.length > 1 ? [parts[0], parts[1]] : [EXPRESSION_WILDCARD, parts[0]];
      flat[composeKey(charName, expression, motion)] = config;
    }
  }
  registry.set(flat);
}

// テーブル登録の代わりに、命名規則から機械的にパスを組み立てたい場合用。
export function setAnimAssetResolver(
  fn: (characterName: string, expression: string, motion: string) => AnimAssetConfig | undefined
): void {
  registry.setResolver((key) => {
    const [charName, expression, motion] = key.split(':');
    return fn(charName, expression, motion);
  });
}

export function getAnimAsset(
  characterName: string,
  expression: string | undefined,
  motion: string | undefined
): AnimAssetConfig | undefined {
  if (!motion) return undefined;
  const exp = expression ?? 'normal';
  return (
    registry.get(composeKey(characterName, exp, motion)) ??
    registry.get(composeKey(characterName, EXPRESSION_WILDCARD, motion))
  );
}

export function getAllAnimAssets(): Record<string, AnimAssetConfig> {
  return registry.getAll();
}
