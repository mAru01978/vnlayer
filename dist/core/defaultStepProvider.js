import { serverStepProvider } from "./serverStepProvider";
// context/StoryContext.tsx(Next.js用)もstandalone.ts(vnlayer.js用)も同じ
// components/VNLayerOverlay.tsxを使うので、「stepProviderを明示的に渡さなかった場合の
// 既定値」をこの1箇所で切り替えられるようにしておく。
// - Next.js運用: 何もしなければ serverStepProvider のまま(既定)
// - 静的運用(vnlayer.js): standalone.tsが起動時に setDefaultStepProvider(createStaticStepProvider(...)) を呼ぶ
let current = serverStepProvider;
export function setDefaultStepProvider(provider) {
    current = provider;
}
export function getDefaultStepProvider() {
    return current;
}
//# sourceMappingURL=defaultStepProvider.js.map