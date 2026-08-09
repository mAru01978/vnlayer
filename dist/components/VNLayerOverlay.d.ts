/// <reference types="react" />
import type { StepProvider } from '../core/StepProvider';
import type { SetContextOptions } from '../core/types';
import { type StageMode, type UiAnchor } from './StageView';
export type VNLayerMode = StageMode;
export type VNLayerHandle = {
    setContextVars: (vars: Record<string, unknown>, options?: SetContextOptions) => Promise<void>;
    getContextVars: (varNames?: string[]) => Promise<Record<string, unknown>>;
    resetStory: () => Promise<void>;
};
export type VNLayerOverlayProps = {
    clip?: string;
    mode: VNLayerMode;
    uiAnchor?: UiAnchor;
    showUi?: boolean;
    stepProvider?: StepProvider;
    onNavigate?: (path: string) => void;
    onReady?: (handle: VNLayerHandle) => void;
    instanceId?: string;
};
export default function VNLayerOverlay({ clip, mode, uiAnchor, showUi, stepProvider, onNavigate, onReady, instanceId }: VNLayerOverlayProps): import("react").JSX.Element;
//# sourceMappingURL=VNLayerOverlay.d.ts.map