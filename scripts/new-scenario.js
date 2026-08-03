#!/usr/bin/env node
// 新しいシナリオフォルダを雛形付きで作成するCLI。
// 使い方: node VNLayer/scripts/new-scenario.js シナリオ名 [dataディレクトリのパス]
// 例:     node VNLayer/scripts/new-scenario.js Scenario2
//         node VNLayer/scripts/new-scenario.js Scenario3 ./my_custom_data
//
// 既存のシナリオフォルダが既にあれば、上書きせず中断します。

const fs = require("fs");
const path = require("path");

const scenarioName = process.argv[2];
const dataArg = process.argv[3]; // 第2引数でdataディレクトリを受け取る

if (!scenarioName) {
  console.error(
    "使い方: node VNLayer/scripts/new-scenario.js シナリオ名 [dataディレクトリのパス]",
  );
  process.exit(1);
}
if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(scenarioName)) {
  console.error(
    "シナリオ名は英字始まりの英数字・アンダースコアのみにしてください(例: Scenario2, BlogIntro)",
  );
  process.exit(1);
}

// 呼び出し元のプロジェクトルート（npm経由なら INIT_CWD、直接なら process.cwd()）
const projectRoot = process.env.INIT_CWD || process.cwd();

// dataDir の決定 (引数がなければ呼び出し元のプロジェクトの ./data を使用)
const dataDir = dataArg
  ? path.resolve(process.cwd(), dataArg)
  : path.join(projectRoot, "data");

const scenarioDir = path.join(dataDir, scenarioName);

if (fs.existsSync(scenarioDir)) {
  console.error(`既に存在します: ${scenarioDir} (上書きしないので中断します)`);
  process.exit(1);
}

// dataDir自体が存在しない場合も考慮し、knotsディレクトリまで一気に作成する
fs.mkdirSync(path.join(scenarioDir, "knots"), { recursive: true });

fs.writeFileSync(
  path.join(scenarioDir, "story.ink"),
  `INCLUDE vars.ink
INCLUDE knots/start.ink

-> start
`,
);

fs.writeFileSync(
  path.join(scenarioDir, "vars.ink"),
  `// ${scenarioName} 専用のグローバル変数をここに追記していく。
// (characterSlots.json や VNLayer/tags/ のタグ設定は全シナリオ共有なので、
//  ここには "このシナリオだけで使う" 変数だけを置く)
`,
);

fs.writeFileSync(
  path.join(scenarioDir, "knots", "start.ink"),
  `=== start ===
# s:narrator
（${scenarioName} の書き出しをここに書く）

-> END
`,
);

// ログ出力のパス表記をわかりやすくするために相対パス化（表示用）
const displayDir = path.relative(process.cwd(), scenarioDir) || scenarioDir;

console.log(`✓ ${displayDir} を作成しました。`);
console.log("");
console.log("次にやること:");
console.log(
  `  1. ${path.join(displayDir, "knots", "start.ink")} を実際の内容に書き換える`,
);
console.log(
  "  2. npm run compile-story でコンパイル (パスを変えている場合は対象に合わせて実行)",
);
console.log(
  `  3. <StoryProvider scenario="${scenarioName}"> を使うページ/コンポーネントを用意する`,
);
