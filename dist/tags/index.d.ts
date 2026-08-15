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
import "./defs/special/timeline";
import "./defs/special/interrupt";
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
  setSpriteAssets,
  getCharacterSlot,
  getAllCharacterSlots,
  getBackgroundSlot,
  getAllBackgroundSlots,
  resolveSpriteSrc,
  subscribeSpriteAssets,
  getSpriteAssetsVersion,
} from "./spriteAssets";
export type {
  SpriteCharacterConfig,
  SpriteVariantConfig,
} from "./spriteAssets";
export {
  setAnimAssets,
  setAnimAssetResolver,
  getAnimAsset,
  getAllAnimAssets,
  subscribeAnimAssets,
  getAnimAssetsVersion,
} from "./animAssets";
export {
  setAssetsConfig,
  getAssetsConfig,
  subscribeAssetsConfig,
  getAssetsConfigVersion,
} from "./assetsConfig";
export type { AssetsGlobalConfig } from "./assetsConfig";
export {
  setUiConfig,
  getUiConfig,
  subscribeUiConfig,
  getUiConfigVersion,
  getAllUiConfigPatches,
  restoreUiConfigPatches,
} from "./uiConfig";
export type { UiConfig, UiConfigPatch, BacklogMode } from "./uiConfig";
export { setWebLinks, getWebLink } from "./webLinks";
//# sourceMappingURL=index.d.ts.map
