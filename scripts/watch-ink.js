#!/usr/bin/env node
// 任意の場所から実行可能にし、コマンドライン引数で data ディレクトリを指定できるようにしたウォッチャースクリプト
// 使用例: node node_modules/VNLayer/scripts/watch-ink.js [dataディレクトリのパス]
// 例: node node_modules/VNLayer/scripts/watch-ink.js ./data

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// 呼び出し元のプロジェクトルート（npm経由なら INIT_CWD、直接なら process.cwd()）
const projectRoot = process.env.INIT_CWD || process.cwd();

// コマンドライン引数 (process.argv[2]) が指定されていればそれを使用し、
// 未指定の場合は呼び出し元プロジェクトの data ディレクトリにフォールバックします。
const inputArg = process.argv[2];

const dataDir = inputArg
  ? path.resolve(process.cwd(), inputArg)
  : path.join(projectRoot, "data");

let compiling = false;
let pendingRecompile = false;
let debounceTimer = null;

function runCompile() {
  if (compiling) {
    // 今まさにコンパイル中なら、終わった後にもう一度だけやり直す
    pendingRecompile = true;
    return;
  }
  compiling = true;
  console.log("\n[watch-ink] Inkファイルの変更を検知、再コンパイルします...");

  // VNLayer 内にあるコンパイルスクリプトのパス
  const compileScriptPath = path.join(__dirname, "compile-story.js");

  // コンパイルスクリプトへ dataDir のパスを引数として渡し、呼び出し元プロジェクトのルートで実行する
  const child = spawn("node", [compileScriptPath, dataDir], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
  });

  child.on("close", (code) => {
    compiling = false;
    if (code === 0) {
      console.log(
        "[watch-ink] 再コンパイル完了。ブラウザをリロードしてください。",
      );
    } else {
      console.error(
        `[watch-ink] 再コンパイルに失敗しました(exit code ${code})。Inkの文法エラーが無いか確認してください。`,
      );
    }
    if (pendingRecompile) {
      pendingRecompile = false;
      runCompile();
    }
  });
}

function scheduleCompile() {
  // エディタが1回の保存で複数のファイルイベントを発火することがあるので、
  // 少し待ってから1回だけ実行する(デバウンス)。
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runCompile, 300);
}

// 初回起動時に一度コンパイルしておく
runCompile();

// data/ 以下を再帰的に監視し、.ink ファイルの変更だけに反応する。
try {
  // dataディレクトリが存在しない場合は作成しておく
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.watch(dataDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith(".ink")) {
      scheduleCompile();
    }
  });
  console.log(`[watch-ink] ${dataDir} 以下の .ink ファイルを監視しています。`);
} catch (e) {
  console.warn(
    "[watch-ink] ファイル監視の開始に失敗しました(このOS/Node.jsバージョンでは fs.watch の recursive オプションが使えない可能性があります):",
    e,
  );
}

// 汎用的なNodeプロジェクトの開発用コマンド（npm run dev）を呼び出し元プロジェクトのルートで実行
const devProcess = spawn("npm", ["run", "dev"], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: true,
});

devProcess.on("close", (code) => {
  process.exit(code ?? 0);
});

process.on("SIGINT", () => {
  devProcess.kill("SIGINT");
  process.exit(0);
});
