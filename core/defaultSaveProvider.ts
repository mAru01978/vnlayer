import { createLocalStorageSaveProvider } from "./saveProviders/localStorageSaveProvider";
import type { SaveProvider } from "./SaveProvider";

// core/defaultStepProvider.tsと同じパターン: 「saveProviderを明示的に
// 渡さなかった場合の既定値」をここ1箇所で切り替えられるようにする。
// 既定はcreateLocalStorageSaveProvider()(静的実行+ローカルストレージという
// 「サーバー無しで一番手軽に動く」組み合わせを、js/tsc/react全ての入口で
// 共通の既定値にするため)。
let current: SaveProvider = createLocalStorageSaveProvider();

export function setDefaultSaveProvider(provider: SaveProvider): void {
  current = provider;
}

export function getDefaultSaveProvider(): SaveProvider {
  return current;
}
