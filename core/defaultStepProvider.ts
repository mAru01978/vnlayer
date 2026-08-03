import { serverStepProvider } from "./serverStepProvider";
import type { StepProvider } from "./StepProvider";

// context/StoryContext.tsx(Next.js用)もstandalone.ts(vnlayer.js用)も同じ
// components/VNLayerOverlay.tsxを使うので、「stepProviderを明示的に渡さなかった場合の
// 既定値」をこの1箇所で切り替えられるようにしておく。
// - Next.js運用: 何もしなければ serverStepProvider のまま(既定)
// - 静的運用(vnlayer.js): standalone.tsが起動時に setDefaultStepProvider(createStaticStepProvider(...)) を呼ぶ

let current: StepProvider = serverStepProvider;

export function setDefaultStepProvider(provider: StepProvider): void {
  current = provider;
}

export function getDefaultStepProvider(): StepProvider {
  return current;
}
