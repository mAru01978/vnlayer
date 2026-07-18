#!/usr/bin/env node
// data/ 以下の各「シナリオフォルダ」(story.ink を直接持つフォルダ)を見つけて、
// それぞれ <フォルダ>/story.json にコンパイルする。
//
// 例: data/Scenario1/story.ink → data/Scenario1/story.json
//     data/Scenario2/story.ink → data/Scenario2/story.json
//
// 新しいシナリオフォルダ(data/Scenario3/ 等)を追加しても、
// このスクリプト自体は変更不要(story.inkがあるフォルダを自動的に見つける)。
//
// 以前の strip-bom.js の役割(inkjsのコンパイラが出力するBOMの除去)も
// このスクリプト自身で行う(複数ファイルを扱うため、1ファイル固定だった
// 旧strip-bom.jsへの依存をやめて自己完結させた)。
//
// 注意: コンパイル自体は "inkjs-compiler" という独立パッケージではなく、
// inkjsパッケージ自体が提供するコマンド(npx inkjs)で行う。
// ("inkjs-compiler"はinkjsパッケージのbinエイリアス名であり、
//  npmレジストリ上の独立パッケージ名ではないため)

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 移動メモ(フェーズ2): scripts/ が VNLayer/scripts/ に1階層移動したので、
// __dirnameからリポジトリルートまでの相対距離が1つ増えている。
const repoRoot = path.join(__dirname, '..', '..');
const dataDir = path.join(repoRoot, 'data');

function stripBOM(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    fs.writeFileSync(filePath, buf.slice(3));
  }
}

if (!fs.existsSync(dataDir)) {
  console.error(`見つかりません: ${dataDir}`);
  process.exit(1);
}

const scenarioDirs = fs
  .readdirSync(dataDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(dataDir, entry.name))
  .filter((dir) => fs.existsSync(path.join(dir, 'story.ink')));

if (scenarioDirs.length === 0) {
  console.error(
    'story.ink を含むシナリオフォルダが data/ 以下に見つかりませんでした。' +
      '(例: data/Scenario1/story.ink のような構成を想定しています)'
  );
  process.exit(1);
}

let hadError = false;

for (const dir of scenarioDirs) {
  const scenarioName = path.basename(dir);
  const storyInk = path.join(dir, 'story.ink');
  const storyJsonPath = path.join(dir, 'story.json');

  console.log(`\n[compile-story] "${scenarioName}" をコンパイルしています...`);
  try {
    execSync(`npx inkjs -o "${storyJsonPath}" "${storyInk}"`, {
      stdio: 'inherit',
      cwd: repoRoot,
    });
    stripBOM(storyJsonPath);
    console.log(`[compile-story] "${scenarioName}" 完了。`);
  } catch (e) {
    hadError = true;
    console.error(`[compile-story] "${scenarioName}" のコンパイルに失敗しました。`);
  }
}

if (hadError) {
  process.exit(1);
}
