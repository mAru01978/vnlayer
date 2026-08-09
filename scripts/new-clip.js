#!/usr/bin/env node
// 新しいクリップフォルダを雛形付きで作成するCLI。
// (2026-08-08、Scenario→Clip改称: scripts/new-scenario.js から改名。
//  data/以下のフォルダ構成自体はそのまま — clipという呼び方はVNLayer側の
//  概念・APIキー(VNLayer.mount({clip:...})等)の話であり、フォルダ名に
//  「Clip」という接頭辞を強制するものではない。好きな名前でよい)
//
// 使い方: node VNLayer/scripts/new-clip.js クリップ名 [dataディレクトリのパス]
// 例:     node VNLayer/scripts/new-clip.js Clip2
//         node VNLayer/scripts/new-clip.js Clip3 ./my_custom_data
//
// 既存の同名フォルダが既にあれば、上書きせず中断します。

const fs = require("fs");
const path = require("path");

const clipName = process.argv[2];
const dataArg = process.argv[3]; // 第2引数でdataディレクトリを受け取る

if (!clipName) {
  console.error(
    "使い方: node VNLayer/scripts/new-clip.js クリップ名 [dataディレクトリのパス]",
  );
  process.exit(1);
}
if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(clipName)) {
  console.error(
    "クリップ名は英字始まりの英数字・アンダースコアのみにしてください(例: Clip2, BlogIntro)",
  );
  process.exit(1);
}

// 呼び出し元のプロジェクトルート（npm経由なら INIT_CWD、直接なら process.cwd()）
const projectRoot = process.env.INIT_CWD || process.cwd();

// dataDir の決定 (引数がなければ呼び出し元のプロジェクトの ./data を使用)
const dataDir = dataArg
  ? path.resolve(process.cwd(), dataArg)
  : path.join(projectRoot, "data");

const clipDir = path.join(dataDir, clipName);

if (fs.existsSync(clipDir)) {
  console.error(`既に存在します: ${clipDir} (上書きしないので中断します)`);
  process.exit(1);
}

// dataDir自体が存在しない場合も考慮し、knotsディレクトリまで一気に作成する
fs.mkdirSync(path.join(clipDir, "knots"), { recursive: true });

fs.writeFileSync(
  path.join(clipDir, "story.ink"),
  `INCLUDE vars.ink
INCLUDE knots/start.ink

-> start
`,
);

fs.writeFileSync(
  path.join(clipDir, "vars.ink"),
  `// ${clipName} 専用のグローバル変数をここに追記していく。
// (characterSlots.json や VNLayer/tags/ のタグ設定は全クリップ共有なので、
//  ここには "このクリップだけで使う" 変数だけを置く)
`,
);

fs.writeFileSync(
  path.join(clipDir, "knots", "start.ink"),
  `=== start ===
# s:narrator
（${clipName} の書き出しをここに書く）

-> END
`,
);

// ログ出力のパス表記をわかりやすくするために相対パス化（表示用）
const displayDir = path.relative(process.cwd(), clipDir) || clipDir;

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
  `  3. <StoryProvider clip="${clipName}"> を使うページ/コンポーネントを用意する`,
);
