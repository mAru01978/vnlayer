const { execSync } = require('child_process');
try {
  // tscコマンドを実行
  const stdout = execSync('npx tsc -p tsconfig.build.json', { encoding: 'utf8' });
  console.log('実行結果:\n', stdout);
} catch (error) {
  console.error('エラーが発生しました:', error.message);
}
