import "./defs/special/bg";
import "./defs/special/sprite";
import "./defs/special/anim";
import "./defs/basic/cam";
import "./defs/basic/gaze";
import "./defs/special/wait";
import "./defs/basic/flash";
import "./defs/basic/shake";
import "./defs/special/type";
import "./defs/special/ui";
import "./defs/special/web";
import "./defs/special/emit";
import type { TagHandlers } from "./registry";
export declare function dispatchTag(
  tag: string,
  handlers: TagHandlers,
): Promise<void>;
export {
  setTagConfig,
  getTagConfig,
  registerTag,
  registerAlias,
  registerBasicTag,
  warnUnknownTag,
} from "./registry";
export type { TagHandlers } from "./registry";
export {
  setCharacterSlots,
  getCharacterSlot,
  getAllCharacterSlots,
} from "./characterSlots";
export {
  setBackgroundSlots,
  getBackgroundSlot,
  getAllBackgroundSlots,
} from "./backgroundSlots";
export { setUiConfig, getUiConfig } from "./uiConfig";
export type { UiConfig, UiConfigPatch, BacklogMode } from "./uiConfig";
export { setWebLinks, getWebLink } from "./webLinks";
//# sourceMappingURL=index.d.ts.map
