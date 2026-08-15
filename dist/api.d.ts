import { type VNLayerMode } from "./components/VNLayerOverlay";
import type { UiAnchor } from "./components/StageView";
import { type SpriteCharacterConfig } from "./tags/spriteAssets";
import { type UiConfigPatch } from "./tags/index";
import { type AnimAssetConfig } from "./tags/animAssets";
import { type AssetsGlobalConfig } from "./tags/assetsConfig";
import type { SetContextOptions } from "./core/types";
import type { StepProvider } from "./core/StepProvider";
import type { SaveProvider } from "./core/SaveProvider";
import { createServerStepProvider } from "./core/serverStepProvider";
import { createStaticStepProvider } from "./core/staticStepProvider";
import { createLocalStorageSaveProvider } from "./core/saveProviders/localStorageSaveProvider";
import { createCookieSaveProvider } from "./core/saveProviders/cookieSaveProvider";
import { createServerSaveProvider } from "./core/saveProviders/serverSaveProvider";
type MountOptions = {
  clip?: string;
  mode?: VNLayerMode;
  uiAnchor?: UiAnchor;
  showUi?: boolean;
  stepProvider?: StepProvider;
  saveProvider?: SaveProvider | null;
};
declare function mount(selector: string, options: MountOptions): Promise<void>;
declare function unmount(selector: string): Promise<void>;
declare function setContext(
  vars: Record<string, unknown>,
  selector?: string,
  options?: SetContextOptions,
): Promise<void>;
declare function getContext(
  varNames?: string | string[],
  selector?: string,
): Promise<Record<string, unknown>>;
type ConfigureAssetsOptions = AssetsGlobalConfig & {
  sprite?: Record<string, SpriteCharacterConfig>;
  anim?: Record<string, Record<string, AnimAssetConfig>>;
};
type ConfigureOptions = {
  assets?: ConfigureAssetsOptions;
  tags?: Record<string, Record<string, unknown>>;
  ui?: UiConfigPatch;
  webLinks?: Record<string, string>;
};
declare function reset(selector?: string): Promise<void>;
declare function configure(
  options: ConfigureOptions,
  selector?: string,
): Promise<void>;
export declare const VNLayer: {
  mount: typeof mount;
  unmount: typeof unmount;
  setContext: typeof setContext;
  getContext: typeof getContext;
  reset: typeof reset;
  configure: typeof configure;
  serverStepProvider: StepProvider;
  createServerStepProvider: typeof createServerStepProvider;
  createStaticStepProvider: typeof createStaticStepProvider;
  createLocalStorageSaveProvider: typeof createLocalStorageSaveProvider;
  createCookieSaveProvider: typeof createCookieSaveProvider;
  createServerSaveProvider: typeof createServerSaveProvider;
};
export {};
//# sourceMappingURL=api.d.ts.map
