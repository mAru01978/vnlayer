import { type VNLayerMode } from './components/VNLayerOverlay';
import type { UiAnchor } from './components/StageView';
import { type CharacterSlot } from './tags/characterSlots';
import { type BackgroundSlot } from './tags/backgroundSlots';
import { type UiConfigPatch } from './tags/index';
import { type AnimAssetConfig } from './tags/animAssets';
import { type SpriteAssetConfig } from './tags/spriteAssets';
import type { SetContextOptions } from './core/types';
import type { StepProvider } from './core/StepProvider';
import { createServerStepProvider } from './core/serverStepProvider';
import { createStaticStepProvider } from './core/staticStepProvider';
type MountOptions = {
    scenario?: string;
    mode: VNLayerMode;
    uiAnchor?: UiAnchor;
    showUi?: boolean;
    stepProvider?: StepProvider;
};
declare function mount(selector: string, options: MountOptions): Promise<void>;
declare function unmount(selector: string): Promise<void>;
declare function setContext(vars: Record<string, unknown>, selector?: string, options?: SetContextOptions): Promise<void>;
declare function getContext(varNames?: string | string[], selector?: string): Promise<Record<string, unknown>>;
type ConfigureOptions = {
    characterSlots?: Record<string, CharacterSlot>;
    backgroundSlots?: Record<string, BackgroundSlot>;
    tags?: Record<string, Record<string, unknown>>;
    ui?: UiConfigPatch;
    webLinks?: Record<string, string>;
    animAssets?: Record<string, Record<string, AnimAssetConfig>>;
    spriteAssets?: Record<string, Record<string, SpriteAssetConfig>>;
};
declare function reset(selector?: string): Promise<void>;
declare function configure(options: ConfigureOptions, selector?: string): Promise<void>;
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
};
export {};
//# sourceMappingURL=api.d.ts.map