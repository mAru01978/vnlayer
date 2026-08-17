/// <reference types="react" />
import type { StepProvider } from '../core/StepProvider';
import type { SaveProvider } from '../core/SaveProvider';
import type { VNLayerHandle } from '../core/types';
import { type StageMode, type UiAnchor } from './StageView';
export type VNLayerMode = StageMode;
export type { VNLayerHandle } from '../core/types';
export type VNLayerOverlayProps = {
    clip?: string;
    mode?: VNLayerMode;
    uiAnchor?: UiAnchor;
    showUi?: boolean;
    stepProvider?: StepProvider;
    saveProvider?: SaveProvider | null;
    onNavigate?: (path: string) => void;
    onReady?: (handle: VNLayerHandle) => void;
    instanceId?: string;
};
export default function VNLayerOverlay({ clip, mode, uiAnchor, showUi, stepProvider, saveProvider, onNavigate, onReady, instanceId, }: VNLayerOverlayProps): import("react").JSX.Element;
//# sourceMappingURL=VNLayerOverlay.d.ts.map