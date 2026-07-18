#!/usr/bin/env node
// 使い方: node scripts/new-scene.js sceneD
//   1. app/sceneD/page.tsx を空テンプレで作成
//   2. data/knots/sceneD.ink を雛形付きで作成
//   3. data/story.ink に "INCLUDE knots/sceneD.ink" が無ければ追記する

const fs = require('fs');
const path = require('path');

const name = process.argv[2];
if (!name) {
  console.error('使い方: node scripts/new-scene.js <シーン名>');
  process.exit(1);
}
if (!/^[a-zA-Z0-9_]+$/.test(name)) {
  console.error('シーン名は英数字とアンダースコアのみ使えます');
  process.exit(1);
}

const pagePath = path.join('app', name, 'page.tsx');
const inkPath = path.join('data', 'knots', `${name}.ink`);
const storyPath = path.join('data', 'story.ink');

// 1. page.tsx
fs.mkdirSync(path.dirname(pagePath), { recursive: true });
if (fs.existsSync(pagePath)) {
  console.log(`skip: ${pagePath} は既に存在します`);
} else {
  const pageTemplate = `// Stage(実際の画面)はapp/layout.tsxに1つだけ置いてあるので、
// ここでは何もしなくていい。Next.jsのルーティング上、page.tsxの
// 存在自体が必要なので空コンポーネントを置いているだけ。
export default function Page() {
  return null;
}
`;
  fs.writeFileSync(pagePath, pageTemplate);
  console.log(`created: ${pagePath}`);
}

// 2. data/knots/<name>.ink
fs.mkdirSync(path.dirname(inkPath), { recursive: true });
if (fs.existsSync(inkPath)) {
  console.log(`skip: ${inkPath} は既に存在します`);
} else {
  const inkTemplate = `=== ${name} ===
# goto:/${name}
# m:narrator
(ここに${name}の本文を書く)

+ [ホームに戻る] -> home
`;
  fs.writeFileSync(inkPath, inkTemplate);
  console.log(`created: ${inkPath}`);
}

// 3. story.ink に INCLUDE を追記(まだ無ければ)
const includeLine = `INCLUDE knots/${name}.ink`;
const storyContent = fs.readFileSync(storyPath, 'utf-8');
const storyLines = storyContent.split('\n');

if (storyLines.some((l) => l.trim() === includeLine)) {
  console.log(`skip: story.ink には既に "${includeLine}" があります`);
} else {
  // 最後のINCLUDE行の直後に挿入する。INCLUDE行が無ければ先頭に挿入する。
  let lastIncludeIndex = -1;
  storyLines.forEach((l, i) => {
    if (l.trim().startsWith('INCLUDE')) lastIncludeIndex = i;
  });
  const insertAt = lastIncludeIndex >= 0 ? lastIncludeIndex + 1 : 0;
  storyLines.splice(insertAt, 0, includeLine);
  fs.writeFileSync(storyPath, storyLines.join('\n'));
  console.log(`updated: ${storyPath} に "${includeLine}" を追記しました`);
}

console.log('\n完了。あとはdata/knots/' + name + '.inkの本文を書くだけです。');
