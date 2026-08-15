#!/usr/bin/env node
// 任意の場所から実行可能にし、コマンドライン引数で data ディレクトリの指定を必須にしたスクリプト
// (2026-08-08、Scenario→Clip改称: 内部変数名/ログ文言をclip呼びに統一。
//  対象を探す条件自体は変わらず「story.inkを含むdata直下のフォルダ」)
// 使用例: node scripts/compile-story.js ./data
//     node scripts/compile-story.js /path/to/my/custom/data

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// 第1引数 (process.argv[2]) で data ディレクトリのパスを受け取る（必須）
const inputArg = process.argv[2];

if (!inputArg) {
  console.error("エラー: dataディレクトリのパスを指定してください。");
  console.error("使用例: node scripts/compile-story.js ./data");
  process.exit(1);
}

// 実行時のカレントディレクトリを基準に絶対パスへ変換
const dataDir = path.resolve(process.cwd(), inputArg);
const execCwd = process.cwd();

function stripBOM(filePath) {
  const buf = fs.readFileSync(filePath);
  if (
    buf.length >= 3 &&
    buf[0] === 0xef &&
    buf[1] === 0xbb &&
    buf[2] === 0xbf
  ) {
    fs.writeFileSync(filePath, buf.slice(3));
  }
}

if (!fs.existsSync(dataDir)) {
  console.error(`見つかりません: ${dataDir}`);
  process.exit(1);
}

const clipDirs = fs
  .readdirSync(dataDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(dataDir, entry.name))
  .filter((dir) => fs.existsSync(path.join(dir, "story.ink")));

if (clipDirs.length === 0) {
  console.error(
    `指定されたディレクトリ (${dataDir}) 以下に story.ink を含むクリップフォルダが見つかりませんでした。`,
  );
  process.exit(1);
}

let hadError = false;

for (const dir of clipDirs) {
  const clipName = path.basename(dir);
  const storyInk = path.join(dir, "story.ink");
  const storyJsonPath = path.join(dir, "story.json");

  console.log(`\n[compile-story] "${clipName}" をコンパイルしています...`);
  try {
    execSync(`npx inkjs -o "${storyJsonPath}" "${storyInk}"`, {
      stdio: "inherit",
      cwd: execCwd,
    });
    stripBOM(storyJsonPath);
    console.log(`[compile-story] "${clipName}" 完了。`);
  } catch (e) {
    hadError = true;
    console.error(`[compile-story] "${clipName}" のコンパイルに失敗しました。`);
  }
}

if (hadError) {
  process.exit(1);
}
