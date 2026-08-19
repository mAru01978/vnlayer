#!/usr/bin/env node
// 使い方:
//   node scripts/new-character.js <キャラ名> <originX> <originY> [ファイル名]
//
// 例:
//   node scripts/new-character.js mika 40 55
//   node scripts/new-character.js mika 40 55 data/anotherCharacterSlots.json
//
// 指定したJSONに { "mika": { "originX": 40, "originY": 55 } } を追記する
// 既に同名キャラがいる場合は座標を上書きする(確認メッセージを出す)
//
// ファイル名を省略した場合:
//   data/characterSlots.json

const fs = require("fs");
const path = require("path");

const [, , name, originXArg, originYArg, fileArg] = process.argv;

if (!name || originXArg === undefined || originYArg === undefined) {
  console.error(
    "使い方: node scripts/new-character.js <キャラ名> <originX> <originY> [ファイル名]",
  );
  console.error("例:     node scripts/new-character.js mika 40 55");
  console.error(
    "例:     node scripts/new-character.js mika 40 55 data/anotherCharacterSlots.json",
  );
  process.exit(1);
}

const originX = Number(originXArg);
const originY = Number(originYArg);

if (Number.isNaN(originX) || Number.isNaN(originY)) {
  console.error(
    "originX / originY は数値で指定してください(0〜100のパーセント想定)",
  );
  process.exit(1);
}

const jsonPath = fileArg || path.join("data", "characterSlots.json");

if (!fs.existsSync(jsonPath)) {
  console.error(`JSONファイルが見つかりません: ${jsonPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(jsonPath, "utf-8");
const slots = JSON.parse(raw);

const isUpdate = Object.prototype.hasOwnProperty.call(slots, name);
slots[name] = { originX, originY };

fs.writeFileSync(jsonPath, JSON.stringify(slots, null, 2) + "\n");

if (isUpdate) {
  console.log(
    `updated: "${name}" の座標を (${originX}, ${originY}) に上書きしました`,
  );
} else {
  console.log(`added: "${name}" を (${originX}, ${originY}) で追加しました`);
}

console.log(`file: ${jsonPath}`);

console.log(
  "\n完了。あとはInk側で # c:" +
    name +
    ":表情 / # m:" +
    name +
    " を書くだけです。",
);
