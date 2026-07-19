// esbuildでこのファイルを入口としてバンドルすると vnlayer.js が出来上がる想定
// (scripts/build-vnlayer-standalone.js 参照)。
//
// index.html側の使い方:
//   <script src="vnlayer.js"></script>
//   <script>
//     VNLayer.mount("#vn", { scenario: "Scenario1", mode: "overlay" });
//     VNLayer.setContext({ seconds: new Date().getSeconds() });
//   </script>
//
// data/<scenario>/story.json は vnlayer.js と同じ階層に data/ フォルダごと
// 置いておく(dataBaseUrlはVNLayer.configureや後述の window.VNLAYER_DATA_BASE_URL で変更可)。
import { createStaticStepProvider } from './core/staticStepProvider';
import { setDefaultStepProvider } from './core/defaultStepProvider';
import './api'; // side-effect: window.VNLayer を公開する
const dataBaseUrl = typeof window !== 'undefined' ? window.VNLAYER_DATA_BASE_URL ?? './data' : './data';
// Next.js運用(context/StoryContext.tsx)と違い、こちらは既定でサーバーを
// 一切呼ばないstaticStepProviderを使う(index.html + vnlayer.js + assetsだけで完結)。
setDefaultStepProvider(createStaticStepProvider({ dataBaseUrl }));
//# sourceMappingURL=standalone.js.map