/// <reference types="react" />
import type { StepProvider } from '../core/StepProvider';
import { type StageMode, type UiAnchor } from './StageView';
export type VNLayerMode = StageMode;
export type VNLayerHandle = {
    setContextVars: (vars: Record<string, unknown>) => Promise<void>;
    resetStory: () => Promise<void>;
    notify: (eventName: string, payload?: unknown) => Promise<void>;
};
export type VNLayerOverlayProps = {
    scenario?: string;
    mode: VNLayerMode;
    uiAnchor?: UiAnchor;
    showUi?: boolean;
    stepProvider?: StepProvider;
    onNavigate?: (path: string) => void;
    onReady?: (handle: VNLayerHandle) => void;
};
export default function VNLayerOverlay({ scenario, mode, uiAnchor, showUi, stepProvider, onNavigate, onReady }: VNLayerOverlayProps): import("react").JSX.Element;
//# sourceMappingURL=VNLayerOverlay.d.ts.map