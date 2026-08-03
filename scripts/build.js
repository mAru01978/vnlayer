#!/usr/bin/env node
// 既存の2つのビルド(tsc型定義+JSモジュール出力 と esbuild単体バンドル)を
// まとめて1回で実行するCLI。CI(GitHub Actions)・Dockerfile経由のビルドは
// このスクリプト1本を叩くだけで済むようにする狙い(package.jsonの
// "build" / "build:vnlayer" を個別に手で2回叩く必要が無くなる)。
//
// 使い方:
//   node scripts/build.js
//   npm run build:all
//
// どちらかのステップが失敗したら、そこで打ち切ってexit code 1で終了する
// (CIが失敗を正しく検知できるように)。

const { execFileSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");

const steps = [
  {
    label: "tscビルド(型定義 + JSモジュール出力 → dist/)",
    script: "build-vnlayer-tsc.js",
  },
  {
    label: "単体バンドル(esbuild → dist/vnlayer.js)",
    script: "build-vnlayer-standalone.js",
  },
];

for (const step of steps) {
  console.log(`\n=== ${step.label} ===`);
  try {
    execFileSync(process.execPath, [path.join(__dirname, step.script)], {
      stdio: "inherit",
      cwd: root,
    });
  } catch (e) {
    console.error(`\n✗ 「${step.label}」に失敗しました。ビルドを中断します。`);
    process.exit(1);
  }
}

console.log("\n✓ 全ビルド完了(tsc出力 + 単体バンドルの両方)。");
