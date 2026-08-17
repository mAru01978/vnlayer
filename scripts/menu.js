#!/usr/bin/env node
// scripts/ 以下の各スクリプトを、矢印キー(↑↓)+Enterで選んで実行できる
// 対話式メニュー。新しいnpmパッケージは使わせず、Node標準機能だけで実装している。
//
// 使い方: node scripts/menu.js
// ↑↓キーで選択、Enterで実行、Ctrl+C または「終了」でメニューを抜ける。
// 追加の入力(シーン名等)が必要な項目だけ、選んだ後にその場でタイプする。

const { spawnSync } = require("child_process");
const readline = require("readline");
const path = require("path");

// npm --prefix 経由で実行された場合でも、呼び出し元のプロジェクトルートを維持する
const projectRoot = process.env.INIT_CWD || path.resolve(__dirname, "..", "..");
const defaultDataDir = path.join(projectRoot, "data");
const vnlayerRoot = path.join(__dirname, "..");

// ---------------------------------------------------------------------------
// 共通ヘルパー
// ---------------------------------------------------------------------------

function runDirect(cmdParts) {
  console.log(`\n$ ${cmdParts.join(" ")}\n`);
  spawnSync(cmdParts[0], cmdParts.slice(1), {
    stdio: "inherit",
    shell: true,
    cwd: projectRoot,
  });
}

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function askDataDir() {
  const input = await askQuestion(
    `dataディレクトリのパス [未入力の場合は ${defaultDataDir}]: `,
  );
  return input || defaultDataDir;
}

async function runWithPrompt(question, buildCmd) {
  const answer = await askQuestion(question);
  if (!answer) {
    console.log("入力が空だったので中断しました。");
    return;
  }
  runDirect(buildCmd(answer));
}

function showMenu(items, title = "メニュー") {
  return new Promise((resolve) => {
    let selected = 0;

    function render() {
      console.clear();
      console.log(`=== ${title}(↑↓で選択、Enterで実行、Ctrl+Cで終了) ===\n`);
      items.forEach((item, i) => {
        const cursor = i === selected ? "> " : " ";
        console.log(`${cursor}${item.label}`);
      });
    }

    render();
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.resume();

    function onKeypress(str, key) {
      if (key.ctrl && key.name === "c") {
        cleanup();
        process.exit(0);
      } else if (key.name === "up") {
        selected = (selected - 1 + items.length) % items.length;
        render();
      } else if (key.name === "down") {
        selected = (selected + 1) % items.length;
        render();
      } else if (key.name === "return") {
        cleanup();
        resolve(items[selected]);
      }
    }

    function cleanup() {
      process.stdin.removeListener("keypress", onKeypress);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.pause();
    }

    process.stdin.on("keypress", onKeypress);
  });
}

/** サブメニューを開く。戻る(value===null)で親に戻る。 */
async function runSubmenu(items, title) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const item = await showMenu(items, title);
    if (item.value === null || item.label === "戻る") {
      return;
    }
    console.log("");
    await item.run();
    console.log("\n(Enterキーでサブメニューに戻ります)");
    await askQuestion("");
  }
}

// ---------------------------------------------------------------------------
// サブメニュー定義
// ---------------------------------------------------------------------------

const CHARACTER_FILE_MENU_ITEMS = [
  {
    label: "data/spriteAssets.json",
    value: path.join("data", "spriteAssets.json"),
  },
  {
    label: "ファイル名を直接入力",
    value: "__CUSTOM__",
  },
  {
    label: "戻る",
    value: null,
  },
];

const VENDOR_MENU_ITEMS = [
  {
    label: "全て更新",
    value: "",
    run: async () => {
      runDirect(["node", path.join(__dirname, "update-vendor.js")]);
    },
  },
  {
    label: "inkjs/inkjs-compiler",
    value: "inkjs",
    run: async () => {
      runDirect(["node", path.join(__dirname, "update-vendor.js"), "inkjs"]);
    },
  },
  {
    label: "gsap",
    value: "gsap",
    run: async () => {
      runDirect(["node", path.join(__dirname, "update-vendor.js"), "gsap"]);
    },
  },
  {
    label: "jotai",
    value: "jotai",
    run: async () => {
      runDirect(["node", path.join(__dirname, "update-vendor.js"), "jotai"]);
    },
  },
  {
    label: "戻る",
    value: null,
  },
];

const DEV_MENU_ITEMS = [
  {
    label: "開発用dev起動 + inkホットリロード(watch-ink.js)",
    run: async () => {
      const targetDataDir = await askDataDir();
      runDirect(["node", path.join(__dirname, "watch-ink.js"), targetDataDir]);
    },
  },
  {
    label: "Inkを再コンパイル(compile-story.js)",
    run: async () => {
      const targetDataDir = await askDataDir();
      runDirect([
        "node",
        path.join(__dirname, "compile-story.js"),
        targetDataDir,
      ]);
    },
  },
  {
    label: "戻る",
    value: null,
  },
];

const CREATE_MENU_ITEMS = [
  {
    label: "新しいキャラクターを追加(new-character.js)",
    run: async () => {
      const fileItem = await showMenu(
        CHARACTER_FILE_MENU_ITEMS,
        "キャラクター保存先を選択",
      );
      if (fileItem.value === null) return;

      let targetFile = fileItem.value;
      if (targetFile === "__CUSTOM__") {
        targetFile = await askQuestion(
          "JSONファイルのパスを入力してください: ",
        );
        if (!targetFile) {
          console.log("入力が空だったので中断しました。");
          return;
        }
      }

      const questions = [
        "キャラ名を入力してください(例: mika): ",
        "立ち位置 originX(0-100の数値): ",
        "立ち位置 originY(0-100の数値): ",
      ];
      const answers = [];
      for (const question of questions) {
        const answer = await askQuestion(question);
        if (!answer) {
          console.log("入力が空だったので中断しました。");
          return;
        }
        answers.push(answer);
      }
      runDirect([
        "node",
        path.join(__dirname, "new-character.js"),
        ...answers,
        targetFile,
      ]);
    },
  },
  {
    label: "新しいタグの雛形を追加(new-tag.js)",
    run: () =>
      runWithPrompt("タグ名を入力してください(例: sfx): ", (name) => [
        "node",
        path.join(__dirname, "new-tag.js"),
        name,
      ]),
  },
  {
    label: "新しいクリップを追加(new-clip.js)",
    run: async () => {
      const clipName = await askQuestion(
        "クリップ名を入力してください(例: Clip2): ",
      );
      if (!clipName) {
        console.log("入力が空だったので中断しました。");
        return;
      }
      const targetDataDir = await askDataDir();
      runDirect([
        "node",
        path.join(__dirname, "new-clip.js"),
        clipName,
        targetDataDir,
      ]);
    },
  },
  {
    label: "戻る",
    value: null,
  },
];

const TAGS_MENU_ITEMS = [
  {
    label: "タグ一覧(TAGS.md)を生成(list-tags.js)",
    run: () => runDirect(["node", path.join(__dirname, "list-tags.js")]),
  },
  {
    label: "タグのラベルをチェック(lint-tags.js)",
    run: () => runDirect(["node", path.join(__dirname, "lint-tags.js")]),
  },
  {
    label: "戻る",
    value: null,
  },
];

const BUILD_MENU_ITEMS = [
  {
    label:
      "VNLayerのJSビルド、React等のランタイム全バンドル(build-vnlayer-standalone.js)",
    run: () =>
      runDirect(["node", path.join(__dirname, "build-vnlayer-standalone.js")]),
  },
  {
    label: "VNLayerのTypeScriptビルド(build-vnlayer-tsc.js)",
    run: () =>
      runDirect(["node", path.join(__dirname, "build-vnlayer-tsc.js")]),
  },
  {
    label: "VNLayerの全ビルド(build.js)",
    run: () => runDirect(["node", path.join(__dirname, "build.js")]),
  },
  {
    label: "戻る",
    value: null,
  },
];

const DEPS_MENU_ITEMS = [
  {
    label: "vendorを更新(update-vendor.js)",
    run: async () => {
      await runSubmenu(VENDOR_MENU_ITEMS, "vendor更新対象選択");
    },
  },
  {
    label: "VNLayerの依存関係をインストール(npm install)",
    run: () => {
      console.log(`\n$ npm install (at ${vnlayerRoot})\n`);
      spawnSync("npm", ["install"], {
        stdio: "inherit",
        shell: true,
        cwd: vnlayerRoot,
      });
    },
  },
  {
    label: "戻る",
    value: null,
  },
];

// ---------------------------------------------------------------------------
// トップメニュー
// ---------------------------------------------------------------------------

const MENU_ITEMS = [
  {
    label: "開発・実行 ▶",
    run: async () => {
      await runSubmenu(DEV_MENU_ITEMS, "開発・実行");
    },
  },
  {
    label: "新規作成 ▶",
    run: async () => {
      await runSubmenu(CREATE_MENU_ITEMS, "新規作成");
    },
  },
  {
    label: "タグ ▶",
    run: async () => {
      await runSubmenu(TAGS_MENU_ITEMS, "タグ");
    },
  },
  {
    label: "ビルド ▶",
    run: async () => {
      await runSubmenu(BUILD_MENU_ITEMS, "ビルド");
    },
  },
  {
    label: "依存関係・vendor ▶",
    run: async () => {
      await runSubmenu(DEPS_MENU_ITEMS, "依存関係・vendor");
    },
  },
  {
    label: "終了",
    run: () => {
      process.exit(0);
    },
  },
];

// ---------------------------------------------------------------------------
// 入口
// ---------------------------------------------------------------------------

async function main() {
  if (!process.stdin.isTTY) {
    console.error(
      "対話式メニューには対応した端末(TTY)が必要です。通常のターミナルから実行してください。",
    );
    process.exit(1);
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const item = await showMenu(MENU_ITEMS, "開発用スクリプトメニュー");
    console.log("");
    await item.run();
    if (item.label === "終了") break;

    // サブメニューから戻った場合もトップに戻るので、余計な Enter 待ちはしない
    // （サブ内で既に Enter 待ちしているため）
  }
}

main();
