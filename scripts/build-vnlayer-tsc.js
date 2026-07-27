#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('tsc実行開始...');

  // VNLayer パッケージのルートディレクトリ（scripts のひとつ上の階層）
  const vnlayerRoot = path.join(__dirname, '..');
  const tsconfigPath = path.join(vnlayerRoot, 'tsconfig.build.json');

  // VNLayer のルートを基準にして tsc を実行する
  execSync(`npx tsc -p "${tsconfigPath}"`, {
    stdio: 'inherit',
    cwd: vnlayerRoot, // 実行ディレクトリを VNLayer パッケージ内に固定
  });

  console.log('tsc実行完了');
} catch (error) {
  console.error('エラーが発生しました:', error.message);
  process.exit(1);
}
