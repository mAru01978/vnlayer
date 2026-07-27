#!/usr/bin/env node
// 任意の場所から実行可能にし、コマンドライン引数で data ディレクトリを指定できるようにしたウォッチャースクリプト
// 使用例: node watch-ink.js [dataディレクトリのパス]
// 例: node watch-ink.js ./data
//     node watch-ink.js /path/to/my/custom/data

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// コマンドライン引数 (process.argv[2]) が指定されていればそれを使用し、
// 未指定の場合はスクリプトからの相対パス (../../data) にフォールバックします。
const inputArg = process.argv[2];

const dataDir = inputArg
  ? path.resolve(process.cwd(), inputArg)
  : path.join(__dirname, '..', '..', 'data');

// リポジトリルートなど、コマンドを実行する基準ディレクトリ
const root = path.join(__dirname, '..', '..');

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
  console.log('\n[watch-ink] Inkファイルの変更を検知、再コンパイルします...');

  // コンパイルスクリプトへ dataDir のパスを引数として渡す
  const child = spawn('node', [path.join(__dirname, 'compile.js'), dataDir], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  });

  child.on('close', (code) => {
    compiling = false;
    if (code === 0) {
      console.log('[watch-ink] 再コンパイル完了。ブラウザをリロードしてください。');
    } else {
      console.error(
        `[watch-ink] 再コンパイルに失敗しました(exit code ${code})。Inkの文法エラーが無いか確認してください。`
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
  fs.watch(dataDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.ink')) {
      scheduleCompile();
    }
  });
  console.log(`[watch-ink] ${dataDir} 以下の .ink ファイルを監視しています。`);
} catch (e) {
  console.warn(
    '[watch-ink] ファイル監視の開始に失敗しました(このOS/Node.jsバージョンでは fs.watch の recursive オプションが使えない可能性があります):',
    e
  );
}

// Next.jsの開発サーバーを起動(ログはそのままターミナルに出す)
const next = spawn('npx', ['next', 'dev', '--webpack'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

next.on('close', (code) => {
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  next.kill('SIGINT');
  process.exit(0);
});
