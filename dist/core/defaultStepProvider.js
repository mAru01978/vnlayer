import { createStaticStepProvider } from "./staticStepProvider";
// context/StoryContext.tsx(Next.js用)もstandalone.ts(vnlayer.js用)もreact.tsx
// (vnlayer/react用)も同じcomponents/VNLayerOverlay.tsxを使うので、
// 「stepProviderを明示的に渡さなかった場合の既定値」をこの1箇所で切り替え
// られるようにしておく。
//
// 修正メモ(2026-08-08): 既定値を serverStepProvider から
// createStaticStepProvider({dataBaseUrl:"./data"}) へ変更した。
// js/tsc/reactのどの入口から使っても、追加設定なしでまず動く
// (VNLayer.mount(sel,{clip}) や <VNLayer clip="X" /> だけで、
// ./data/<clip>/story.json を直接fetchして完結する)ことを優先した判断。
//
// 従来通りサーバー側でInkを実行したい(Next.js API Route + cookieセッション
// 方式)場合は、アプリ起動時に
//   import { setDefaultStepProvider } from "vnlayer/core/defaultStepProvider";
//   import { serverStepProvider } from "vnlayer/core/serverStepProvider";
//   setDefaultStepProvider(serverStepProvider);
// を呼ぶか、mount()/<VNLayer>にstepProvider={serverStepProvider}を明示的に
// 渡すこと(この変更は破壊的変更 — 既存プロジェクトで暗黙にサーバー実行に
// 依存していた場合は、明示的な指定が必要になる)。
let current = createStaticStepProvider({ dataBaseUrl: "./data" });
export function setDefaultStepProvider(provider) {
  current = provider;
}
export function getDefaultStepProvider() {
  return current;
}
//# sourceMappingURL=defaultStepProvider.js.map
