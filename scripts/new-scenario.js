#!/usr/bin/env node
// 新しいシナリオフォルダを雛形付きで作成するCLI。
// 使い方: node VNLayer/scripts/new-scenario.js シナリオ名
// 例:     node VNLayer/scripts/new-scenario.js Scenario2
//
// 作られるもの:
//   data/シナリオ名/story.ink   (INCLUDE文 + -> start だけのエントリポイント)
//   data/シナリオ名/vars.ink    (空のグローバル変数ファイル、必要になったら追記)
//   data/シナリオ名/knots/start.ink (最初のknot。何か1行喋って終わるだけの最小構成)
//
// 既存のシナリオフォルダが既にあれば、上書きせず中断する(new-scene.jsと同じ安全設計)。
// 作成後は npm run compile-story で data/シナリオ名/story.json が生成される。

const fs = require('fs');
const path = require('path');

const scenarioName = process.argv[2];
if (!scenarioName) {
  console.error('使い方: node VNLayer/scripts/new-scenario.js シナリオ名');
  process.exit(1);
}
if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(scenarioName)) {
  console.error('シナリオ名は英字始まりの英数字・アンダースコアのみにしてください(例: Scenario2, BlogIntro)');
  process.exit(1);
}

// 移動メモ(フェーズ2): scripts/ が VNLayer/scripts/ に1階層移動したので、
// __dirnameからリポジトリルートまでの相対距離が1つ増えている。
const root = path.join(__dirname, '..', '..');
const dataDir = path.join(root, 'data');
const scenarioDir = path.join(dataDir, scenarioName);

if (fs.existsSync(scenarioDir)) {
  console.error(`既に存在します: data/${scenarioName}/ (上書きしないので中断します)`);
  process.exit(1);
}

fs.mkdirSync(path.join(scenarioDir, 'knots'), { recursive: true });

fs.writeFileSync(
  path.join(scenarioDir, 'story.ink'),
  `INCLUDE vars.ink
INCLUDE knots/start.ink

-> start
`
);

fs.writeFileSync(
  path.join(scenarioDir, 'vars.ink'),
  `// ${scenarioName} 専用のグローバル変数をここに追記していく。
// (data/characterSlots.json や VNLayer/tags/ のタグ設定は全シナリオ共有なので、
//  ここには "このシナリオだけで使う" 変数だけを置く)
`
);

fs.writeFileSync(
  path.join(scenarioDir, 'knots', 'start.ink'),
  `=== start ===
# s:narrator
（${scenarioName} の書き出しをここに書く）

-> END
`
);

console.log(`✓ data/${scenarioName}/ を作成しました。`);
console.log('');
console.log('次にやること:');
console.log(`  1. data/${scenarioName}/knots/start.ink を実際の内容に書き換える`);
console.log('  2. npm run compile-story でコンパイル');
console.log(`  3. <StoryProvider scenario="${scenarioName}"> を使うページ/コンポーネントを用意する`);
