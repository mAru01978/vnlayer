import { type VNLayerMode } from './components/VNLayerOverlay';
import type { UiAnchor } from './components/StageView';
import { type CharacterSlot } from './tags/characterSlots';
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
declare function setContext(vars: Record<string, unknown>, selector?: string): Promise<void>;
declare function notify(eventName: string, payload?: unknown, selector?: string): Promise<void>;
type ConfigureOptions = {
    characterSlots?: Record<string, CharacterSlot>;
    tags?: Record<string, Record<string, unknown>>;
};
declare function reset(selector?: string): Promise<void>;
declare function configure(options: ConfigureOptions): Promise<void>;
export declare const VNLayer: {
    mount: typeof mount;
    unmount: typeof unmount;
    setContext: typeof setContext;
    notify: typeof notify;
    reset: typeof reset;
    configure: typeof configure;
    serverStepProvider: StepProvider;
    createServerStepProvider: typeof createServerStepProvider;
    createStaticStepProvider: typeof createStaticStepProvider;
};
export {};
//# sourceMappingURL=api.d.ts.map