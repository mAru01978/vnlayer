#!/usr/bin/env node
// #anim(単一ファイル方式)用の素材変換スクリプト。
//
// 本番の想定フロー:
//   CSP等でアニメーションを作る → 透過アニメーションwebpとして書き出す
//   → このスクリプトでwebm(VP9 + アルファチャンネル)に変換
//   → <video>タグで表示 → GSAPで再生位置/速度/ループを制御
//     (components/mockRenderer.tsxのCharacterSprite参照)
//
// アニメーションwebpをブラウザの<video>で直接扱うのは対応がまちまちで
// 不安定なため、事前にwebmへ変換しておく。ffmpeg-staticでffmpeg本体を
// 別途インストールせずに使えるようにしている(vendor/inkjsと同じ「実行時
// 依存を外部に持ち出さない」方針)。
//
// 使い方:
//   node VNLayer/scripts/convert-anim-webp-to-webm.js <入力ディレクトリ> [出力ディレクトリ] [--force]
// 例:
//   node VNLayer/scripts/convert-anim-webp-to-webm.js ./data/assets/anim_src
//     → ./data/assets/anim_src 内の *.webp を同じ場所に *.webm として書き出す
//   node VNLayer/scripts/convert-anim-webp-to-webm.js ./data/assets/anim_src ./data/assets/anim
//     → 出力先を別ディレクトリに指定
//   --force を付けると、変換済み(.webpより新しい.webmが既にある)ファイルも
//   再変換する。既定では「.webpより.webmが新しい」ファイルはスキップする
//   (差分だけ変換して待ち時間を減らすため)。
//
// 変換コマンドの実体(参考、シェルで直接試す場合):
//   ffmpeg -i input.webp -c:v libvpx-vp9 -pix_fmt yuva420p output.webm

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

let ffmpegPath;
try {
  ffmpegPath = require("ffmpeg-static");
} catch (e) {
  console.error(
    "[convert-anim] ffmpeg-static が見つかりません。VNLayerのdevDependenciesに含まれているはずなので、",
  );
  console.error("              まず `npm install` を実行してください。");
  process.exit(1);
}
if (!ffmpegPath) {
  console.error(
    "[convert-anim] ffmpeg-static がこのプラットフォーム向けのffmpegバイナリを提供できませんでした。",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const positional = args.filter((a) => !a.startsWith("--"));
const inputArg = positional[0];
const outputArg = positional[1];

if (!inputArg) {
  console.error(
    "使い方: node VNLayer/scripts/convert-anim-webp-to-webm.js <入力ディレクトリ> [出力ディレクトリ] [--force]",
  );
  process.exit(1);
}

const inputDir = path.resolve(process.cwd(), inputArg);
const outputDir = outputArg ? path.resolve(process.cwd(), outputArg) : inputDir;

if (!fs.existsSync(inputDir)) {
  console.error(`見つかりません: ${inputDir}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const webpFiles = fs
  .readdirSync(inputDir)
  .filter((f) => f.toLowerCase().endsWith(".webp"));

if (webpFiles.length === 0) {
  console.log(
    `[convert-anim] ${path.relative(process.cwd(), inputDir)} に .webp ファイルが見つかりませんでした。`,
  );
  process.exit(0);
}

let converted = 0;
let skipped = 0;
let failed = 0;

for (const file of webpFiles) {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file.replace(/\.webp$/i, ".webm"));

  if (!force && fs.existsSync(outputPath)) {
    const srcMtime = fs.statSync(inputPath).mtimeMs;
    const outMtime = fs.statSync(outputPath).mtimeMs;
    if (outMtime >= srcMtime) {
      console.log(
        `skip: ${file} (変換済み。再変換するには --force を付けて実行)`,
      );
      skipped += 1;
      continue;
    }
  }

  console.log(`convert: ${file} → ${path.basename(outputPath)}`);
  try {
    execFileSync(
      ffmpegPath,
      [
        "-y", // 既存の出力ファイルを無confirmationで上書き
        "-i",
        inputPath,
        "-c:v",
        "libvpx-vp9",
        "-pix_fmt",
        "yuva420p", // アルファチャンネル(透過)を維持する
        "-an", // 音声トラックは不要(演出用アニメーションのため)
        outputPath,
      ],
      { stdio: "inherit" },
    );
    converted += 1;
  } catch (e) {
    console.error(`✗ ${file} の変換に失敗しました:`, e.message);
    failed += 1;
  }
}

console.log("");
console.log(
  `✓ 完了: ${converted}件変換 / ${skipped}件スキップ / ${failed}件失敗`,
);
if (failed > 0) process.exit(1);
