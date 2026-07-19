// 使い方:
//   npm install --save-dev esbuild   (未導入なら)
//   node scripts/build-vnlayer-standalone.js
// 出力: dist/vnlayer.js (1ファイル、React/ReactDOM/inkjsを含む完全バンドル)
//
// 注意: このスクリプトはVNLayer/standalone.tsを入口にする。
// Next.js側(context/StoryContext.tsx等)はバンドル対象に含まれない
// (standalone.tsがそちらをimportしていないので、そもそもツリーに乗らない)。

const esbuild = require('esbuild');
const path = require('path');

const root = path.resolve(__dirname, "..");
esbuild
  .build({
    absWorkingDir: root,
    entryPoints: [path.join(root, 'standalone.ts')],
    bundle: true,
    minify: true,
    format: 'iife',
    globalName: '__vnlayerBundleInit', // window.VNLayerはapi.ts側で自分でwindowに生やす
    target: ['es2019'],
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  })
  .then(() => {
    console.log('✓ dist/vnlayer.js を出力しました');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
