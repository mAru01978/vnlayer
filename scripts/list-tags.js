#!/usr/bin/env node
// VNLayer/tags/defs/{basic,special}/*.ts の中身から、今使えるタグとラベルの
// 一覧を自動生成してMarkdownで書き出すCLI。
//
// 使い方: node VNLayer/scripts/list-tags.js
// → プロジェクトルートに TAGS.md を生成(既にあれば上書き)

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const tagsDefsDir = path.join(__dirname, "..", "tags", "defs");
const outputPath = path.join(root, "TAGS.md");

if (!fs.existsSync(tagsDefsDir)) {
  console.error(`見つかりません: ${tagsDefsDir}`);
  console.error("このスクリプトはscripts/に置かれている前提です。");
  process.exit(1);
}

// タグ名 → defaultConfig内の対応表のネストしたキー名。
// ラベル対応表を持たないタグ(bg/c/anim/s/hide/choices/goto/clear/msg_fade/msg_window等)は
// ここに載せない(ラベル一覧を出さない、という判断がそのまま反映される)。
const TAG_LABEL_KEY = {
  wait: "durations",
  shake: "presets",
  cam: "scales",
  pos: "presets",
  flash: "colors",
  type: "speeds",
  anim_speed: "speeds",
};

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractObjectLiteralAfter(text, keyword) {
  const kwIndex = text.indexOf(keyword);
  if (kwIndex === -1) return null;
  const braceStart = text.indexOf("{", kwIndex);
  if (braceStart === -1) return null;
  const braceEnd = findMatchingBrace(text, braceStart);
  if (braceEnd === -1) return null;
  return text.slice(braceStart, braceEnd + 1);
}

function extractNestedObjectLiteral(objectText, nestedKey) {
  const re = new RegExp(`${nestedKey}\\s*:\\s*\\{`);
  const m = re.exec(objectText);
  if (!m) return null;
  const braceStart = objectText.indexOf("{", m.index);
  const braceEnd = findMatchingBrace(objectText, braceStart);
  if (braceEnd === -1) return null;
  return objectText.slice(braceStart, braceEnd + 1);
}

function extractTopLevelKeys(objectText) {
  const inner = objectText.slice(1, -1);
  const keys = [];
  let depth = 0;
  let buffer = "";
  const flush = () => {
    const cleaned = buffer
      .split("\n")
      .map((line) => line.replace(/\/\/.*$/, ""))
      .join("\n");
    const trimmed = cleaned.trim();
    buffer = "";
    if (!trimmed) return;
    const m = trimmed.match(/^'?([a-zA-Z0-9_]+)'?\s*:/);
    if (m) keys.push(m[1]);
  };
  for (const ch of inner) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (ch === "," && depth === 0) {
      flush();
      continue;
    }
    buffer += ch;
  }
  flush();
  return keys;
}

// tags/defs/(basic|special)/<name>.ts を再帰的に列挙する。basic/special
// 分離より前のバージョンからの移行時、旧フラットファイル(tags/defs/*.ts
// 直下)を消し忘れていても二重に拾わないよう、直下の.tsファイルではなく
// サブディレクトリの中の.tsファイルだけを対象にする。
function listDefFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue; // basic/ special/ 以外の直下ファイルは無視
    const categoryDir = path.join(dir, entry.name);
    for (const file of fs.readdirSync(categoryDir, { withFileTypes: true })) {
      if (file.isFile() && file.name.endsWith(".ts")) {
        results.push({
          filePath: path.join(categoryDir, file.name),
          category: entry.name,
        });
      }
    }
  }
  return results;
}

// tags/defs/{basic,special}/<name>.ts 1ファイルから
// { タグ名, カテゴリ(basic/special), 説明, ラベル一覧 } を抽出する。
function extractTagInfo(filePath, category) {
  const source = fs.readFileSync(filePath, "utf8");
  const lines = source.split("\n");

  // registerTag<WaitConfig>({...}) のようにジェネリック型引数を使っている
  // タグは"registerTag("という文字列にならない(<...>が間に挟まる)ため、
  // "registerTag"という部分文字列の有無で判定している。basic側の
  // registerBasicTag(...)は別途チェックする。
  const registerLineIndex = lines.findIndex(
    (l) => l.includes("registerTag") || l.includes("registerBasicTag"),
  );
  if (registerLineIndex === -1) return null;

  const keyMatch = source.match(/key:\s*'([a-zA-Z_]+)'/);
  if (!keyMatch) return null;
  const tagName = keyMatch[1];

  const comments = [];
  for (let j = registerLineIndex - 1; j >= 0; j--) {
    const trimmed = lines[j].trim();
    if (trimmed === "") continue;
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
    const configBlock = extractObjectLiteralAfter(
      source,
      "const defaultConfig",
    );
    const nestedBlock = configBlock
      ? extractNestedObjectLiteral(configBlock, nestedKey)
      : null;
    if (nestedBlock) labels = extractTopLevelKeys(nestedBlock);
  }

  return { tagName, category, description: comments.join(" / "), labels };
}

const tags = listDefFiles(tagsDefsDir)
  .map(({ filePath, category }) => extractTagInfo(filePath, category))
  .filter(Boolean)
  .sort((a, b) => a.tagName.localeCompare(b.tagName));

let md = "# 使えるタグ一覧\n\n";
md +=
  "このファイルは `node VNLayer/scripts/list-tags.js` で自動生成されています。";
md += "手で編集しても次回実行時に上書きされるので、内容を直したい場合は";
md +=
  " `VNLayer/tags/defs/basic|special/<タグ名>.ts` 側の(registerTag/registerBasicTagの";
md += "直前の)コメントを直してから再生成してください。\n\n";
md += "`(basic)` は状態(atom)への書き込みだけで完結する単純なタグ、";
md += "`(special)` は複数の分岐/副作用先を持つタグを表します(実装はどちらも";
md +=
  "core/managers/以下のマネージャーを直接呼ぶ形式で、core/useStoryEngine.tsは経由しません)。\n\n";

for (const { tagName, category, description, labels } of tags) {
  md += `## \`${tagName}\` (${category})\n\n`;
  if (description) {
    md += `${description}\n\n`;
  }
  if (labels.length > 0) {
    md += "使えるラベル: " + labels.map((l) => `\`${l}\``).join(", ") + "\n\n";
  }
}

fs.writeFileSync(outputPath, md);
console.log(
  `✓ ${path.relative(root, outputPath)} を生成しました(${tags.length}個のタグ)。`,
);
