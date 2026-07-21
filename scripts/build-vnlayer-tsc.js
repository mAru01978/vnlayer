const { execSync } = require('child_process');

try {
  console.log('tsc実行開始...');

  execSync('npx tsc -p tsconfig.build.json', {
    stdio: 'inherit'
  });

  console.log('tsc実行完了');
} catch (error) {
  console.error('エラーが発生しました:', error.message);
  process.exit(1);
}
