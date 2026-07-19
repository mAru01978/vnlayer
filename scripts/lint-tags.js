#!/usr/bin/env node
// data/ 以下の全Inkファイルをスキャンし、"# タグ名:ラベル" の形で使われている
// ラベルが、VNLayer/tags/defs/<タグ名>.ts の defaultConfig に実在するかをチェックするCLI。
//
// 移動メモ(フェーズ2): 以前は lib/story/tagConfig.ts 1ファイルの対応表を見ていたが、
// タグの実装が VNLayer/tags/defs/*.ts (1タグ1ファイル、
// registerTag({key, defaultConfig, run})形式)に移ったのに合わせて全面的に書き換えた。
//
// 使い方:
//   node VNLayer/scripts/lint-tags.js
//
// 注意: これは簡易的な文字列ベースのチェッカーで、TypeScriptを正しく
// パースしているわけではない(各tags/defs/*.tsのdefaultConfigが
// `const defaultConfig: XxxConfig = { ネストしたキー: { key1: ..., key2: ... }, ... };`
// という見慣れた形で書かれている前提)。書き方を大きく変えた場合は
// このスクリプトの抽出ロジックも調整が必要になる。

const fs = require('fs');
const path = require('path');

// scripts/ は VNLayer/scripts/ に置かれている前提(このファイルの1つ上がVNLayer/)。
const root = path.join(__dirname, '..', '..');
const tagsDefsDir = path.join(__dirname, '..', 'tags', 'defs');
const dataDir = path.join(root, 'data');

if (!fs.existsSync(tagsDefsDir)) {
  console.error(`見つかりません: ${tagsDefsDir}`);
  console.error('このスクリプトはVNLayer/scripts/に置かれている前提です。');
  process.exit(1);
}

// タグ名 → defaultConfig内の「ラベル→値」対応表が入っているネストしたキー名。
// ラベル対応表を持たないタグ(bg/c/anim/s/hide/choices/goto/clear/msg_fade/msg_window等)は
// ここに載せない(=チェック対象外)。
const TAG_LABEL_KEY = {
  wait: 'durations',
  shake: 'presets',
  cam: 'scales',
  pos: 'presets',
  flash: 'colors',
  type: 'speeds',
  anim_speed: 'speeds',
};

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractObjectLiteralAfter(text, keyword) {
  const kwIndex = text.indexOf(keyword);
  if (kwIndex === -1) return null;
  const braceStart = text.indexOf('{', kwIndex);
  if (braceStart === -1) return null;
  const braceEnd = findMatchingBrace(text, braceStart);
  if (braceEnd === -1) return null;
  return text.slice(braceStart, braceEnd + 1);
}

function extractNestedObjectLiteral(objectText, nestedKey) {
  const re = new RegExp(`${nestedKey}\\s*:\\s*\\{`);
  const m = re.exec(objectText);
  if (!m) return null;
  const braceStart = objectText.indexOf('{', m.index);
  const braceEnd = findMatchingBrace(objectText, braceStart);
  if (braceEnd === -1) return null;
  return objectText.slice(braceStart, braceEnd + 1);
}

// objectTextの「トップレベルのキーだけ」を拾う(ネストした値の中身は無視する)。
function extractTopLevelKeys(objectText) {
  const inner = objectText.slice(1, -1);
  const keys = new Set();
  let depth = 0;
  let buffer = '';
  const flush = () => {
    const trimmed = buffer.trim();
    buffer = '';
    if (!trimmed || trimmed.startsWith('//')) return;
    const m = trimmed.match(/^'?([a-zA-Z0-9_]+)'?\s*:/);
    if (m) keys.add(m[1]);
  };
  for (const ch of inner) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (ch === ',' && depth === 0) {
      flush();
      continue;
    }
    buffer += ch;
  }
  flush();
  return keys;
}

function listInkFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listInkFiles(full));
    } else if (entry.name.endsWith('.ink')) {
      results.push(full);
    }
  }
  return results;
}

const configKeysByTag = {};
for (const [tag, nestedKey] of Object.entries(TAG_LABEL_KEY)) {
  const filePath = path.join(tagsDefsDir, `${tag}.ts`);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ tags/defs/${tag}.ts が見つかりませんでした(タグ "${tag}" のチェックをスキップします)`);
    continue;
  }
  const source = fs.readFileSync(filePath, 'utf8');
  const configBlock = extractObjectLiteralAfter(source, 'const defaultConfig');
  const nestedBlock = configBlock ? extractNestedObjectLiteral(configBlock, nestedKey) : null;
  if (!nestedBlock) {
    console.warn(`⚠ tags/defs/${tag}.ts のdefaultConfig内に "${nestedKey}" が見つかりませんでした(スキップします)`);
    continue;
  }
  configKeysByTag[tag] = extractTopLevelKeys(nestedBlock);
}

if (!fs.existsSync(dataDir)) {
  console.error(`見つかりません: ${dataDir}`);
  process.exit(1);
}

const inkFiles = listInkFiles(dataDir);
let problemCount = 0;

// "# タグ名:引数1:引数2" の形のタグ行を拾う(引数は無くてもOK)。
const tagLinePattern = /^\s*#\s*([a-zA-Z_]+):([a-zA-Z0-9_.]+)(?::([a-zA-Z0-9_.]+))?/;

for (const file of inkFiles) {
  const rel = path.relative(root, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const m = line.match(tagLinePattern);
    if (!m) return;
    const [, tag, arg1, arg2] = m;
    const validLabels = configKeysByTag[tag];
    if (!validLabels) return; // このタグはラベル対応表を持たない(bg/c/anim/hide/choices/s/goto/msg等)ので対象外

    // タグごとに「どの引数がラベルか」の位置が違う。
    // cam:モーション:対象キャラ → 1番目がラベル
    // pos:キャラ名:プリセット名  → 2番目がラベル("reset"は特別なキーワードなので対象外)
    // anim_speed:キャラ名:速度  → 2番目がラベル
    let label;
    if (tag === 'pos' || tag === 'anim_speed') {
      if (arg2 === 'reset') return;
      label = arg2;
    } else {
      label = arg1;
    }

    if (!label || label === '_ref') return; // _refは動的解決される特別な値なので対象外
    // ラベルの代わりに生の数値(wait:1500、cam:1.8、shake:8:400等)を直接
    // 書けるようになったタグがあるので、数値として解釈できる場合はチェック対象外にする。
    if (!Number.isNaN(Number(label)) && label.trim() !== '') return;
    if (!validLabels.has(label)) {
      console.error(
        `✗ ${rel}:${i + 1}  "${tag}:${arg1}${arg2 ? ':' + arg2 : ''}" の "${label}" というラベルは tags/defs/${tag}.ts に存在しません`
      );
      problemCount += 1;
    }
  });
}

if (problemCount === 0) {
  console.log(`✓ 問題なし(${inkFiles.length}個のInkファイルをチェックしました)`);
  process.exit(0);
} else {
  console.error(`\n${problemCount}件、存在しないラベルが見つかりました。`);
  console.error('タグ名のタイポか、tags/defs/<タグ名>.ts側にラベルを追加し忘れていないか確認してください。');
  process.exit(1);
}
