#!/usr/bin/env node
// data/ 以下の全Inkファイルをスキャンし、"# タグ名:ラベル" の形で使われている
// ラベルが、VNLayer/tags/defs/{basic,special}/<タグ名>.ts の defaultConfig に
// 実在するかをチェックするCLI。
//
// 使い方:
//   node VNLayer/scripts/lint-tags.js

const fs = require("fs");
const path = require("path");

const projectRoot = process.env.INIT_CWD || process.cwd();
const vnlayerRoot = path.join(__dirname, "..");
const tagsDefsDir = path.join(vnlayerRoot, "tags", "defs");
const dataDir = path.join(projectRoot, "data");

if (!fs.existsSync(tagsDefsDir)) {
  console.error(`見つかりません: ${tagsDefsDir}`);
  console.error("VNLayerのパッケージ構造が正しくありません。");
  process.exit(1);
}

const TAG_LABEL_KEY = {
  wait: "durations",
  shake: "presets",
  cam: "scales",
  pos: "presets",
  flash: "colors",
  type: "speeds",
  anim_speed: "speeds",
};

// tags/defs/basic/<tag>.ts → tags/defs/special/<tag>.ts の順で探し、
// 見つかった方のパスを返す(無ければnull)。
function resolveDefFilePath(tag) {
  for (const category of ["basic", "special"]) {
    const candidate = path.join(tagsDefsDir, category, `${tag}.ts`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

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
  const keys = new Set();
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
    if (m) keys.add(m[1]);
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

function listInkFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listInkFiles(full));
    } else if (entry.name.endsWith(".ink")) {
      results.push(full);
    }
  }
  return results;
}

const configKeysByTag = {};
for (const [tag, nestedKey] of Object.entries(TAG_LABEL_KEY)) {
  const filePath = resolveDefFilePath(tag);
  if (!filePath) {
    console.warn(
      `⚠ tags/defs/{basic,special}/${tag}.ts が見つかりませんでした(タグ "${tag}" のチェックをスキップします)`,
    );
    continue;
  }
  const source = fs.readFileSync(filePath, "utf8");
  const configBlock = extractObjectLiteralAfter(source, "const defaultConfig");
  const nestedBlock = configBlock
    ? extractNestedObjectLiteral(configBlock, nestedKey)
    : null;
  if (!nestedBlock) {
    console.warn(
      `⚠ ${path.relative(vnlayerRoot, filePath)} のdefaultConfig内に "${nestedKey}" が見つかりませんでした(スキップします)`,
    );
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

const tagLinePattern =
  /^\s*#\s*([a-zA-Z_]+):([a-zA-Z0-9_.]+)(?::([a-zA-Z0-9_.]+))?/;

for (const file of inkFiles) {
  const rel = path.relative(projectRoot, file);
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const m = line.match(tagLinePattern);
    if (!m) return;
    const [, tag, arg1, arg2] = m;
    const validLabels = configKeysByTag[tag];
    if (!validLabels) return;

    let label;
    if (tag === "pos" || tag === "anim_speed") {
      if (arg2 === "reset") return;
      label = arg2;
    } else {
      label = arg1;
    }

    if (!label || label === "_ref") return;
    if (!Number.isNaN(Number(label)) && label.trim() !== "") return;
    if (!validLabels.has(label)) {
      console.error(
        `✗ ${rel}:${i + 1} "${tag}:${arg1}${arg2 ? ":" + arg2 : ""}" の "${label}" というラベルは tags/defs/{basic,special}/${tag}.ts に存在しません`,
      );
      problemCount += 1;
    }
  });
}

if (problemCount === 0) {
  console.log(
    `✓ 問題なし(${inkFiles.length}個のInkファイルをチェックしました)`,
  );
  process.exit(0);
} else {
  console.error(`\n${problemCount}件、存在しないラベルが見つかりました。`);
  console.error(
    "タグ名のタイポか、tags/defs/{basic,special}/<タグ名>.ts側にラベルを追加し忘れていないか確認してください。",
  );
  process.exit(1);
}
