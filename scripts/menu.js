#!/usr/bin/env node
// VNLayer/scripts/ 以下の各スクリプトを、矢印キー(↑↓)+Enterで選んで実行できる
// 対話式メニュー。新しいnpmパッケージは使わず、Node標準機能だけで実装している。
//
// 使い方: node VNLayer/scripts/menu.js
//   ↑↓キーで選択、Enterで実行、Ctrl+C または「終了」でメニューを抜ける。
//   追加の入力(シーン名等)が必要な項目だけ、選んだ後にその場でタイプする。

const { spawnSync } = require('child_process');
const readline = require('readline');

// メニューに出す項目一覧。新しいスクリプトを増やしたら、ここに1項目足すだけでよい。
const MENU_ITEMS = [
  {
    label: '新しいシーンを追加(new-scene.js)',
    run: () => runWithPrompt('シーン名を入力してください(例: sceneD): ', (name) => ['node', 'VNLayer/scripts/new-scene.js', name]),
  },
  {
    label: '新しいキャラクターを追加(new-character.js)',
    run: () =>
      runWithPrompts(
        [
          { question: 'キャラ名を入力してください(例: mika): ' },
          { question: '立ち位置 originX(0-100の数値): ' },
          { question: '立ち位置 originY(0-100の数値): ' },
        ],
        (answers) => ['node', 'VNLayer/scripts/new-character.js', ...answers]
      ),
  },
  {
    label: '新しいタグの雛形を追加(new-tag.js)',
    run: () => runWithPrompt('タグ名を入力してください(例: sfx): ', (name) => ['node', 'VNLayer/scripts/new-tag.js', name]),
  },
  {
    label: '新しいシナリオを追加(new-scenario.js)',
    run: () =>
      runWithPrompt('シナリオ名を入力してください(例: Scenario2): ', (name) => [
        'node',
        'VNLayer/scripts/new-scenario.js',
        name,
      ]),
  },
  {
    label: 'タグ一覧(TAGS.md)を生成(list-tags.js)',
    run: () => runDirect(['node', 'VNLayer/scripts/list-tags.js']),
  },
  {
    label: 'タグのラベルをチェック(lint-tags.js)',
    run: () => runDirect(['node', 'VNLayer/scripts/lint-tags.js']),
  },
  {
    label: 'Inkを再コンパイル(compile-story.js)',
    run: () => runDirect(['node', 'VNLayer/scripts/compile-story.js']),
  },
  {
    label: 'inkjs/inkjs-compilerをvendor/に固定・更新(update-vendor.js)',
    run: () => runDirect(['node', 'VNLayer/scripts/update-vendor.js']),
  },
  {
    label: '終了',
    run: () => {
      process.exit(0);
    },
  },
];

function runDirect(cmdParts) {
  console.log(`\n$ ${cmdParts.join(' ')}\n`);
  spawnSync(cmdParts[0], cmdParts.slice(1), { stdio: 'inherit', shell: true });
}

function askQuestion(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function runWithPrompt(question, buildCmd) {
  const answer = await askQuestion(question);
  if (!answer) {
    console.log('入力が空だったので中断しました。');
    return;
  }
  runDirect(buildCmd(answer));
}

async function runWithPrompts(questions, buildCmd) {
  const answers = [];
  for (const q of questions) {
    const answer = await askQuestion(q.question);
    if (!answer) {
      console.log('入力が空だったので中断しました。');
      return;
    }
    answers.push(answer);
  }
  runDirect(buildCmd(answers));
}

// ここから先が「矢印キーで選ぶメニュー」本体。
// Node標準のreadline + 生のキー入力(raw mode)だけで実装している。
function showMenu() {
  return new Promise((resolve) => {
    let selected = 0;

    function render() {
      console.clear();
      console.log('=== 開発用スクリプトメニュー(↑↓で選択、Enterで実行、Ctrl+Cで終了) ===\n');
      MENU_ITEMS.forEach((item, i) => {
        const cursor = i === selected ? '> ' : '  ';
        console.log(`${cursor}${item.label}`);
      });
    }

    render();

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.resume();

    function onKeypress(str, key) {
      if (key.ctrl && key.name === 'c') {
        cleanup();
        process.exit(0);
      } else if (key.name === 'up') {
        selected = (selected - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
        render();
      } else if (key.name === 'down') {
        selected = (selected + 1) % MENU_ITEMS.length;
        render();
      } else if (key.name === 'return') {
        cleanup();
        resolve(MENU_ITEMS[selected]);
      }
    }

    function cleanup() {
      process.stdin.removeListener('keypress', onKeypress);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.pause();
    }

    process.stdin.on('keypress', onKeypress);
  });
}

async function main() {
  // 一部の端末(TTYでない環境、CI等)ではrawモードが使えないため、
  // その場合は矢印キーメニューを諦めて素直にエラーメッセージを出す。
  if (!process.stdin.isTTY) {
    console.error('対話式メニューには対応した端末(TTY)が必要です。通常のターミナルから実行してください。');
    process.exit(1);
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const item = await showMenu();
    console.log(''); // メニュー選択後に少し余白
    await item.run();
    if (item.label === '終了') break;
    console.log('\n(Enterキーでメニューに戻ります)');
    await askQuestion('');
  }
}

main();
