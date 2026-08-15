import { type DependencyList, type RefObject } from "react";
import { type VNLayerMode } from "./components/VNLayerOverlay";
import type { UiAnchor } from "./components/StageView";
import { type UiConfigPatch } from "./tags/index";
import { type AnimAssetConfig } from "./tags/animAssets";
import { type SpriteCharacterConfig } from "./tags/spriteAssets";
import { type AssetsGlobalConfig } from "./tags/assetsConfig";
import type { StepProvider } from "./core/StepProvider";
import type { SaveProvider } from "./core/SaveProvider";
import type { SetContextOptions } from "./core/types";
export type VNLayerProps = {
    clip?: string;
    mode?: VNLayerMode;
    uiAnchor?: UiAnchor;
    showUi?: boolean;
    stepProvider?: StepProvider;
    saveProvider?: SaveProvider | null;
    onNavigate?: (path: string) => void;
    ui?: UiConfigPatch;
    instanceId?: string;
    onReady?: () => void;
};
export type VNLayerRef = {
    setContext: (vars: Record<string, unknown>, options?: SetContextOptions) => Promise<void>;
    getContext: (varNames?: string[]) => Promise<Record<string, unknown>>;
    reset: () => Promise<void>;
};
export declare const VNLayer: import("react").ForwardRefExoticComponent<VNLayerProps & import("react").RefAttributes<VNLayerRef>>;
type ConfigureAssetsOptions = AssetsGlobalConfig & {
    sprite?: Record<string, SpriteCharacterConfig>;
    anim?: Record<string, Record<string, AnimAssetConfig>>;
};
export type ConfigureVNLayerOptions = {
    assets?: ConfigureAssetsOptions;
    tags?: Record<string, Record<string, unknown>>;
    ui?: UiConfigPatch;
    webLinks?: Record<string, string>;
};
export declare function configureVNLayer(options: ConfigureVNLayerOptions): void;
export declare function useVNLayerContext(vnRef: RefObject<VNLayerRef | null>, vars: Record<string, unknown>, deps: DependencyList, options?: SetContextOptions): void;
export { createStaticStepProvider } from "./core/staticStepProvider";
export { serverStepProvider, createServerStepProvider, } from "./core/serverStepProvider";
export { createLocalStorageSaveProvider } from "./core/saveProviders/localStorageSaveProvider";
export { createCookieSaveProvider } from "./core/saveProviders/cookieSaveProvider";
export { createServerSaveProvider } from "./core/saveProviders/serverSaveProvider";
export type { StepProvider } from "./core/StepProvider";
export type { SaveProvider, SaveData } from "./core/SaveProvider";
export type { VNLayerHandle, SetContextOptions } from "./core/types";
//# sourceMappingURL=react.d.ts.map