import './defs/bg';
import './defs/s';
import './defs/anim';
import './defs/cam';
import './defs/gaze';
import './defs/wait';
import './defs/flash';
import './defs/shake';
import './defs/type';
import './defs/ui';
import './defs/web';
import type { SceneHandlers } from './sceneHandlers';
export declare function dispatchTag(tag: string, handlers: SceneHandlers): Promise<void>;
export { setTagConfig, getTagConfig, registerTag, registerAlias } from './registry';
export type { SceneHandlers } from './sceneHandlers';
export { setCharacterSlots, getCharacterSlot, getAllCharacterSlots } from './characterSlots';
export { setUiConfig, getUiConfig } from './uiConfig';
export type { UiConfig, UiConfigPatch, BacklogMode } from './uiConfig';
//# sourceMappingURL=index.d.ts.map