// 使い方:
//   npm install --save-dev esbuild   (未導入なら)
//   node scripts/build-vnlayer-standalone.js
// 出力: dist/vnlayer.js (1ファイル、React/ReactDOM/inkjsを含む完全バンドル)
//
// 注意: このスクリプトはVNLayer自身のstandalone.tsを入口にする。
// Next.js側(context/StoryContext.tsx等)はバンドル対象に含まれない
// (standalone.tsがそちらをimportしていないので、そもそもツリーに乗らない)。
const fs = require("fs");
const esbuild = require("esbuild");
const path = require("path");
const root = path.resolve(__dirname, "..");
const entryFile = path.join(root, "standalone.ts");
const outFile = path.join(root, "dist/vnlayer.js");
console.log("--- ビルド開始 ---");
console.log("Entry Point:", entryFile);
console.log("Output File:", outFile);
console.log("distフォルダ存在:", fs.existsSync(path.join(root, "dist")));

esbuild
  .build({
    absWorkingDir: root,
    entryPoints: [entryFile],
    outfile: outFile,
    bundle: true,
    minify: true,
    format: "iife",
    globalName: "__vnlayerBundleInit", // window.VNLayerはapi.ts側で自分でwindowに生やす
    target: ["es2019"],
    loader: { ".tsx": "tsx", ".ts": "ts" },
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  })
  .then(() => {
    console.log("✓ dist/vnlayer.js を出力しました");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
