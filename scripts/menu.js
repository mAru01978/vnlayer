#!/usr/bin/env node
//  scripts/ 以下の各スクリプトを、矢印キー(↑↓)+Enterで選んで実行できる
// 対話式メニュー。新しいnpmパッケージは使わせず、Node標準機能だけで実装している。
//
// 使い方: node  scripts/menu.js
//   ↑↓キーで選択、Enterで実行、Ctrl+C または「終了」でメニューを抜ける。
//   追加の入力(シーン名等)が必要な項目だけ、選んだ後にその場でタイプする。

const { spawnSync } = require('child_process');
const readline = require('readline');
const path = require('path');

// npm --prefix 経由で実行された場合でも、呼び出し元のプロジェクトルートを維持する
const projectRoot = process.env.INIT_CWD || path.resolve(__dirname, '..', '..');
const defaultDataDir = path.join(projectRoot, 'data');

// メニューに出す項目一覧。スクリプトパスは絶対パスで安全に指定。
const MENU_ITEMS = [
  {
    label: '開発用dev起動 + inkホットリロード(watch-ink.js)',
    run: async () => {
      const dataDirInput = await askQuestion(`dataディレクトリのパス [未入力の場合は ${defaultDataDir}]: `);
      const targetDataDir = dataDirInput ? dataDirInput : defaultDataDir;
      runDirect(['node', path.join(__dirname, 'watch-ink.js'), targetDataDir]);
    },
  },

  {
    label: '新しいシーンを追加(new-scene.js)',
    run: () =>
      runWithPrompt('シーン名を入力してください(例: sceneD): ', (name) => [
        'node',
        path.join(__dirname, 'new-scene.js'),
        name,
      ]),
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
        (answers) => ['node', path.join(__dirname, 'new-character.js'), ...answers]
      ),
  },
  {
    label: '新しいタグの雛形を追加(new-tag.js)',
    run: () =>
      runWithPrompt('タグ名を入力してください(例: sfx): ', (name) => [
        'node',
        path.join(__dirname, 'new-tag.js'),
        name,
      ]),
  },
  {
    label: '新しいシナリオを追加(new-scenario.js)',
    run: async () => {
      const scenarioName = await askQuestion('シナリオ名を入力してください(例: Scenario2): ');
      if (!scenarioName) {
        console.log('入力が空だったので中断しました。');
        return;
      }
      const dataDirInput = await askQuestion(`dataディレクトリのパス [未入力の場合は ${defaultDataDir}]: `);
      const targetDataDir = dataDirInput ? dataDirInput : defaultDataDir;

      runDirect(['node', path.join(__dirname, 'new-scenario.js'), scenarioName, targetDataDir]);
    },
  },
  {
    label: 'タグ一覧(TAGS.md)を生成(list-tags.js)',
    run: () => runDirect(['node', path.join(__dirname, 'list-tags.js')]),
  },
  {
    label: 'タグのラベルをチェック(lint-tags.js)',
    run: () => runDirect(['node', path.join(__dirname, 'lint-tags.js')]),
  },
  {
    label: 'Inkを再コンパイル(compile-story.js)',
    run: async () => {
      const dataDirInput = await askQuestion(`dataディレクトリのパス [未入力の場合は ${defaultDataDir}]: `);
      const targetDataDir = dataDirInput ? dataDirInput : defaultDataDir;

      runDirect(['node', path.join(__dirname, 'compile-story.js'), targetDataDir]);
    },
  },
  {
    label: 'inkjs/inkjs-compilerをvendor/に固定・更新(update-vendor.js)',
    run: () => runDirect(['node', path.join(__dirname, 'update-vendor.js')]),
  },
  {
    label: 'VNLayerのJSビルド、React等のランタイム全バンドル(build-vnlayer-standalone.js)',
    run: () => runDirect(['node', path.join(__dirname, 'build-vnlayer-standalone.js')]),
  },
  {
    label: 'VNLayerのTypeScriptビルド(build-vnlayer-tsc.js)',
    run: () => runDirect(['node', path.join(__dirname, 'build-vnlayer-tsc.js')]),
  },
  {
    label: 'VNLayerの全ビルド(build.js)',
    run: () => runDirect(['node', path.join(__dirname, 'build.js')]),
  },
  {
    label: 'VNLayerの依存関係をインストール(npm install)',
    run: () => {
      // menu.js がある場所(__dirname)の親が VNLayer パッケージのルート
      const vnlayerRoot = path.join(__dirname, '..');
      console.log(`\n$ npm install (at ${vnlayerRoot})\n`);
      spawnSync('npm', ['install'], {
        stdio: 'inherit',
        shell: true,
        cwd: vnlayerRoot, // VNLayerのルートディレクトリでnpm installを実行
      });
    },
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
  // 実行時のカレントディレクトリ(cwd)を、呼び出し元のプロジェクトルートに強制する
  spawnSync(cmdParts[0], cmdParts.slice(1), {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot,
  });
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
