#!/usr/bin/env node
// `npm run dev` を、Inkファイルの変更を自動検知して再コンパイルする
// 「開発用ウォッチャー」ごと起動するためのスクリプト。
//
// 今までは data/*.ink を直しても、next dev はTSX/JSファイルの変更しか
// 検知しないため story.json が再コンパイルされず、一旦devサーバーを止めて
// 手動で npm run compile-story を叩き直す必要があった。
// このスクリプトはNext.jsの開発サーバーを起動しつつ、裏側で data/ 以下の
// .ink ファイルの変更を監視し、変更を検知したら自動で再コンパイルする。
//
// 使い方はいつも通り: npm run dev
//
// 新しいnpmパッケージ(nodemonやconcurrently等)は増やさず、
// Node標準の fs.watch / child_process だけで実装している。

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 移動メモ(フェーズ2): scripts/ が VNLayer/scripts/ に1階層移動したので、
// __dirnameからリポジトリルートまでの相対距離が1つ増えている。
// (npm run compile-story / next dev は共にリポジトリルートで実行する必要があるため、
//  ここのrootは「リポジトリルート」を指す)
const root = path.join(__dirname, '..', '..');
const dataDir = path.join(root, 'data');

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

  const child = spawn('npm', ['run', 'compile-story'], {
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

// 初回起動時に一度コンパイルしておく(predevと同じ役割)
runCompile();

// data/ 以下を再帰的に監視し、.ink ファイルの変更だけに反応する。
// 注意: fs.watch の recursive オプションはWindows/macOSでは動作するが、
// Node.jsのバージョンによってはLinuxで非対応の場合がある。
// その場合はこのウォッチャーだけ動かず、警告が出て今まで通り手動での
// npm run compile-story が必要になる(devサーバー自体は問題なく動く)。
try {
  fs.watch(dataDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.ink')) {
      scheduleCompile();
    }
  });
  console.log(`[watch-ink] ${path.relative(root, dataDir)} 以下の .ink ファイルを監視しています。`);
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
