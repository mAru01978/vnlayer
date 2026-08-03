// index.html + <script src="vnlayer.js"> のような、ビルド済みvnlayer.jsを
// <script>タグで読み込むだけの運用向け。VNLayer本体の実行コードはバンドル済み
// vnlayer.js側に既に入っているので、このファイルは「型情報だけ」を提供する
// (実行時に何かをimportしたりバンドルに含めたりする必要はない)。
//
// 使い方(TypeScriptでサイト側の呼び出しコードを書きたい場合):
//   1. npm install --save-dev vnlayer   (このパッケージを型情報の取得だけに使う)
//   2. サイト側のtsconfig.jsonに以下のどちらかを追加
//        "types": ["vnlayer/global"]
//      または、サイト側の任意の.d.tsファイルに
//        /// <reference types="vnlayer/global" />
//   3. あとは普通に window.VNLayer.mount(...) 等が型付きで呼べる
//      (もちろん実行時にvnlayer.jsを<script>で読み込んでおくのは別途必要)
import type { VNLayer as VNLayerApi } from "./api";

declare global {
  interface Window {
    VNLayer: typeof VNLayerApi;
  }
}

export {};
