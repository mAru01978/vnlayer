#!/usr/bin/env node
// VNLayer/tags/defs/*.ts の中身から、今使えるタグとラベルの一覧を自動生成してMarkdownで書き出すCLI。
//
// 移動メモ(フェーズ2): 以前は lib/story/tagDispatcher.ts のswitch-case + lib/story/tagConfig.ts
// を読んでいたが、タグの実装が VNLayer/tags/defs/*.ts (1タグ1ファイル、
// registerTag({key, defaultConfig, run})形式)に移ったのに合わせて全面的に書き換えた。
//
// 使い方: node VNLayer/scripts/list-tags.js
// → プロジェクトルートに TAGS.md を生成(既にあれば上書き)

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const tagsDefsDir = path.join(__dirname, '..', 'tags', 'defs');
const outputPath = path.join(root, 'TAGS.md');

if (!fs.existsSync(tagsDefsDir)) {
  console.error(`見つかりません: ${tagsDefsDir}`);
  console.error('このスクリプトはVNLayer/scripts/に置かれている前提です。');
  process.exit(1);
}

// lint-tags.js と同じマッピング: タグ名 → defaultConfig内の対応表のネストしたキー名。
// ラベル対応表を持たないタグ(bg/c/anim/s/hide/choices/goto/clear/msg_fade/msg_window等)は
// ここに載せない(ラベル一覧を出さない、という判断がそのまま反映される)。
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

function extractTopLevelKeys(objectText) {
  const inner = objectText.slice(1, -1);
  const keys = [];
  let depth = 0;
  let buffer = '';
  const flush = () => {
    const trimmed = buffer.trim();
    buffer = '';
    if (!trimmed || trimmed.startsWith('//')) return;
    const m = trimmed.match(/^'?([a-zA-Z0-9_]+)'?\s*:/);
    if (m) keys.push(m[1]);
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

// tags/defs/<name>.ts 1ファイルから { タグ名, 説明, ラベル一覧 } を抽出する。
// 説明は registerTag(の直前に連続する"//"コメント行(空行は許容)から拾う
// (旧list-tags.jsが switch-case の直後のコメントを拾っていたのと同じ考え方)。
function extractTagInfo(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const lines = source.split('\n');

  const registerLineIndex = lines.findIndex((l) => l.includes('registerTag('));
  if (registerLineIndex === -1) return null;

  const keyMatch = source.match(/key:\s*'([a-zA-Z_]+)'/);
  if (!keyMatch) return null;
  const tagName = keyMatch[1];

  const comments = [];
  for (let j = registerLineIndex - 1; j >= 0; j--) {
    const trimmed = lines[j].trim();
    if (trimmed === '') continue;
    const commentMatch = trimmed.match(/^\/\/\s*(.*)$/);
    if (commentMatch) {
      comments.unshift(commentMatch[1]);
    } else {
      break;
    }
  }

  let labels = [];
  const nestedKey = TAG_LABEL_KEY[tagName];
  if (nestedKey) {
    const configBlock = extractObjectLiteralAfter(source, 'const defaultConfig');
    const nestedBlock = configBlock ? extractNestedObjectLiteral(configBlock, nestedKey) : null;
    if (nestedBlock) labels = extractTopLevelKeys(nestedBlock);
  }

  return { tagName, description: comments.join(' / '), labels };
}

const files = fs.readdirSync(tagsDefsDir).filter((f) => f.endsWith('.ts'));
const tags = files
  .map((f) => extractTagInfo(path.join(tagsDefsDir, f)))
  .filter(Boolean)
  .sort((a, b) => a.tagName.localeCompare(b.tagName));

let md = '# 使えるタグ一覧\n\n';
md += 'このファイルは `node VNLayer/scripts/list-tags.js` で自動生成されています。';
md += '手で編集しても次回実行時に上書きされるので、内容を直したい場合は';
md += ' `VNLayer/tags/defs/<タグ名>.ts` 側の(registerTagの直前の)コメントを直してから再生成してください。\n\n';

for (const { tagName, description, labels } of tags) {
  md += `## \`${tagName}\`\n\n`;
  if (description) {
    md += `${description}\n\n`;
  }
  if (labels.length > 0) {
    md += '使えるラベル: ' + labels.map((l) => `\`${l}\``).join(', ') + '\n\n';
  }
}

fs.writeFileSync(outputPath, md);
console.log(`✓ ${path.relative(root, outputPath)} を生成しました(${tags.length}個のタグ)。`);
