#!/usr/bin/env node
// 新しいタグを追加する時の定型作業を自動化するCLI。
//
// 移動メモ(フェーズ2): タグの実装が VNLayer/tags/defs/*.ts
// (1タグ1ファイル、registerTag({key, defaultConfig?, run})形式)に変わったのに
// 合わせて全面的に書き換えた。以前のようにtagDispatcher.tsのswitch文へ
// caseを追記する方式ではなく、新しいファイルを1つ作ってtags/index.tsに
// 1行importを足すだけで済むようになった。
//
// 使い方:
//   node VNLayer/scripts/new-tag.js タグ名
// 例:
//   node VNLayer/scripts/new-tag.js sfx
//   → VNLayer/tags/defs/sfx.ts のひな形を作成し、tags/index.tsにimportを追記する

const fs = require('fs');
const path = require('path');

const tagName = process.argv[2];
if (!tagName) {
  console.error('使い方: node VNLayer/scripts/new-tag.js タグ名');
  process.exit(1);
}
if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tagName)) {
  console.error('タグ名は英字始まりの英数字・アンダースコアのみにしてください(例: sfx, anim_bounce)');
  process.exit(1);
}

const vnLayerDir = path.join(__dirname, '..');
const defsDir = path.join(vnLayerDir, 'tags', 'defs');
const indexPath = path.join(vnLayerDir, 'tags', 'index.ts');
const newFilePath = path.join(defsDir, `${tagName}.ts`);

if (!fs.existsSync(defsDir) || !fs.existsSync(indexPath)) {
  console.error(`見つかりません: ${defsDir} または ${indexPath}`);
  console.error('このスクリプトはVNLayer/scripts/に置かれている前提です。');
  process.exit(1);
}

if (fs.existsSync(newFilePath)) {
  console.error(`既に存在します: tags/defs/${tagName}.ts (上書きしないので中断します)`);
  process.exit(1);
}

const handlerName = `handle${tagName.charAt(0).toUpperCase()}${tagName.slice(1)}`;

const template = `import { registerTag } from '../registry';

// TODO(${tagName}): 実際に何をするタグか決めて書く。
// ラベル→値の変換テーブル(defaultConfig)が要らないなら、このままでOK。
// 要るなら tags/defs/wait.ts や tags/defs/cam.ts を参考に
// defaultConfig: {...} を追加する(setTagConfigで実行時上書きもできるようになる)。
registerTag({
  key: '${tagName}',
  run: ({ args, handlers }) => {
    // TODO(${tagName}): argsの中身を見て、SceneHandlers側の適切なメソッドを呼ぶ。
    // 既存のhandlersで表現できない新しい種類の状態が必要な場合は、
    // tags/sceneHandlers.ts に ${handlerName} 等のメソッドを追加し、
    // core/useStoryEngine.ts側で実装する必要がある(下のチェックリスト参照)。
    handlers.onUnknownTag?.(['${tagName}', ...args].join(':'));
  },
});
`;

fs.writeFileSync(newFilePath, template);

// tags/index.ts に import を1行追記する(既存のimport群のすぐ後ろに挿入)。
let indexSource = fs.readFileSync(indexPath, 'utf8');
const importLine = `import './defs/${tagName}';`;

if (indexSource.includes(importLine)) {
  console.log(`skip: tags/index.ts には既に "${importLine}" があります`);
} else {
  const importBlockPattern = /(^import '\.\/defs\/[a-zA-Z]+';\n)+/m;
  const match = indexSource.match(importBlockPattern);
  if (match) {
    const insertAt = match.index + match[0].length;
    indexSource = indexSource.slice(0, insertAt) + importLine + '\n' + indexSource.slice(insertAt);
  } else {
    // 万一見つからなければファイル先頭に足す(構造が大きく変わっていない限り通常はここには来ない)
    indexSource = importLine + '\n' + indexSource;
  }
  fs.writeFileSync(indexPath, indexSource);
  console.log(`updated: tags/index.ts に "${importLine}" を追記しました`);
}

console.log(`✓ VNLayer/tags/defs/${tagName}.ts のひな形を作成しました。`);
console.log('');
console.log('残りの手作業(このスクリプトでは自動化していません):');
console.log('');
console.log(`1. VNLayer/tags/defs/${tagName}.ts`);
console.log('   → run()の中身と、必要ならdefaultConfig(ラベル→値の対応表)を書く。');
console.log('');
console.log('2. VNLayer/tags/sceneHandlers.ts');
console.log(`   → 既存のhandlersで表現できないなら、${handlerName} 等の新しいメソッドを型に追加。`);
console.log('');
console.log('3. VNLayer/core/useStoryEngine.ts');
console.log('   → 追加したメソッドの実際の状態更新ロジックを実装し、handlersオブジェクトに含める。');
console.log('');
console.log('4. VNLayer/components/StageView.tsx');
console.log('   → 画面に何か新しい表示要素が必要なら追加する。');
console.log('');
console.log('5. VNLayer/core/inkStepRunner.ts');
console.log('   → bg/c/anim/hideのように「見た目としてリロード後も復元したい」タグなら、');
console.log('     visualの累積更新ロジックにも同じ処理を追加する(演出だけなら不要)。');
console.log('');
console.log(`6. data/<シナリオ>/knots/*.ink で実際に "# ${tagName}:..." を使ってみる。`);
console.log('');
console.log('7. node VNLayer/scripts/list-tags.js でTAGS.mdを再生成。');
console.log('8. node VNLayer/scripts/lint-tags.js でラベルのタイポが無いか確認。');
