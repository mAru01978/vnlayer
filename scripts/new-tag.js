#!/usr/bin/env node
// 新しいタグを追加する時の定型作業を自動化するCLI。
//
// 移動メモ(タグシステム大改修フェーズ2、basic/special分離):
// tags/defs/ を basic/ と special/ の2フォルダに分けた。
//   tags/defs/basic/   … 「1つのatomへの値の書き込みだけ」で完結するタグ。
//                        registerBasicTag({resolve, atomFamily, ...})で書く
//                        (core/atoms.tsまたはcore/managers/にatomFamilyを
//                        追加した上で、手でtags/defs/basic/<タグ名>.tsを書く。
//                        テンプレ生成は非対応 — basic化できるかどうかの
//                        判断そのものが設計判断のため)。
//   tags/defs/special/ … 複数の分岐/副作用先を持つタグ。今まで通り
//                        registerTag({run:...})だが、実装自体はcore/managers/
//                        の関数呼び出しに終始し、core/useStoryEngine.tsは
//                        経由しない(タグシステム大改修フェーズ3)。
//                        このスクリプトが生成するひな形は常にこちら側。
//
// 使い方:
//   node VNLayer/scripts/new-tag.js タグ名
// 例:
//   node VNLayer/scripts/new-tag.js sfx
//   → VNLayer/tags/defs/special/sfx.ts のひな形を作成し、tags/index.tsに
//     importを追記する

const fs = require("fs");
const path = require("path");

const tagName = process.argv[2];
if (!tagName) {
  console.error("使い方: node VNLayer/scripts/new-tag.js タグ名");
  process.exit(1);
}
if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tagName)) {
  console.error(
    "タグ名は英字始まりの英数字・アンダースコアのみにしてください(例: sfx, anim_bounce)",
  );
  process.exit(1);
}

const vnLayerDir = path.join(__dirname, "..");
const defsDir = path.join(vnLayerDir, "tags", "defs", "special");
const indexPath = path.join(vnLayerDir, "tags", "index.ts");
const newFilePath = path.join(defsDir, `${tagName}.ts`);

if (!fs.existsSync(defsDir) || !fs.existsSync(indexPath)) {
  console.error(`見つかりません: ${defsDir} または ${indexPath}`);
  console.error("このスクリプトはVNLayer/scripts/に置かれている前提です。");
  process.exit(1);
}

if (fs.existsSync(newFilePath)) {
  console.error(
    `既に存在します: tags/defs/special/${tagName}.ts (上書きしないので中断します)`,
  );
  process.exit(1);
}

const managerName = `${tagName}Manager`;

const template = `import { registerTag } from '../../registry';
// TODO(${tagName}): 状態を持つ・複数の副作用先があるなら、
// core/managers/${managerName}.ts を新規作成し、そこに書き込み先の
// atomFamilyと操作関数をまとめる(core/managers/backgroundManager.ts等を参考に)。
// import * as ${managerName} from '../../../core/managers/${managerName}';

// TODO(${tagName}): 実際に何をするタグか決めて書く。
// ラベル→値の変換テーブル(defaultConfig)が要らないなら、このままでOK。
// 要るなら tags/defs/special/wait.ts や tags/defs/basic/cam.ts を参考に
// defaultConfig: {...} を追加する(setTagConfigで実行時上書きもできるようになる)。
//
// 「1つのatomへの値の書き込みだけ」で完結すると分かった場合は、このファイルを
// 消して tags/defs/basic/ 側に registerBasicTag({resolve, atomFamily, ...})で
// 書き直すことも検討してほしい(tags/defs/basic/shake.ts参照)。
registerTag({
  key: '${tagName}',
  run: ({ args, handlers }) => {
    // TODO(${tagName}): argsの中身を見て、core/managers/以下の適切な
    // マネージャー関数を呼ぶ(handlers.atomKey / handlers.instanceId を渡す。
    // 使い分けはtags/registry.ts冒頭のコメント参照)。
    // 例: ${managerName}.doSomething(handlers.atomKey, ...);
    console.warn('[VNLayer] TODO: implement tag "${tagName}"', args);
  },
});
`;

fs.writeFileSync(newFilePath, template);

// tags/index.ts に import を1行追記する(既存のimport群のすぐ後ろに挿入)。
let indexSource = fs.readFileSync(indexPath, "utf8");
const importLine = `import './defs/special/${tagName}';`;

if (indexSource.includes(importLine)) {
  console.log(`skip: tags/index.ts には既に "${importLine}" があります`);
} else {
  // basic/special両方のimport行(./defs/basic/xxx または ./defs/special/xxx
  // の形)をひとまとめのブロックとして検出し、その直後に追記する。
  const importBlockPattern =
    /(^import '\.\/defs\/(?:basic|special)\/[a-zA-Z]+';\n)+/m;
  const match = indexSource.match(importBlockPattern);
  if (match) {
    const insertAt = match.index + match[0].length;
    indexSource =
      indexSource.slice(0, insertAt) +
      importLine +
      "\n" +
      indexSource.slice(insertAt);
  } else {
    indexSource = importLine + "\n" + indexSource;
  }
  fs.writeFileSync(indexPath, indexSource);
  console.log(`updated: tags/index.ts に "${importLine}" を追記しました`);
}

console.log(
  `✓ VNLayer/tags/defs/special/${tagName}.ts のひな形を作成しました。`,
);
console.log("");
console.log("残りの手作業(このスクリプトでは自動化していません):");
console.log("");
console.log(`1. VNLayer/tags/defs/special/${tagName}.ts`);
console.log(
  "   → run()の中身と、必要ならdefaultConfig(ラベル→値の対応表)を書く。",
);
console.log("");
console.log(`2. (状態を持つ場合) VNLayer/core/managers/${managerName}.ts`);
console.log("   → atomFamilyの定義と、それを読み書きする関数群を書く。");
console.log(
  "   → core/useStoryEngine.tsは改修不要(タグからマネージャーを直接呼ぶだけ)。",
);
console.log("");
console.log("3. VNLayer/components/StageView.tsx");
console.log("   → 画面に何か新しい表示要素が必要なら、useAtomValue(...)で");
console.log("     マネージャーのatomFamilyを直接読んで追加する。");
console.log("");
console.log("4. VNLayer/core/inkStepRunner.ts");
console.log(
  "   → bg/anim/hideのように「見た目としてリロード後も復元したい」タグなら、",
);
console.log(
  "     visualの累積更新ロジックにも同じ処理を追加する(演出だけなら不要)。",
);
console.log("");
console.log(
  `5. data/<シナリオ>/knots/*.ink で実際に "# ${tagName}:..." を使ってみる。`,
);
console.log("");
console.log("6. node VNLayer/scripts/list-tags.js でTAGS.mdを再生成。");
console.log(
  "7. node VNLayer/scripts/lint-tags.js でラベルのタイポが無いか確認。",
);
