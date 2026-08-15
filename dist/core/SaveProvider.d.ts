import type {
  VisualState,
  PositionOverrides,
  ActiveMessage,
  LineEntry,
} from "./types";
import type { UiConfigPatch } from "../tags/uiConfig";
type SavedCharacterSlot = {
  originX: number;
  originY: number;
};
type SavedBackgroundSlot = {
  color?: string;
  image?: string;
};
export type SaveData = {
  clip: string;
  inkStateJson: string;
  visual: VisualState;
  contextVars: Record<string, unknown>;
  positionOverrides: PositionOverrides;
  uiConfigPatches: Record<string, UiConfigPatch>;
  characterSlots: Record<string, SavedCharacterSlot>;
  backgroundSlots: Record<string, SavedBackgroundSlot>;
  activeMessage: ActiveMessage;
  backlogLines: LineEntry[];
  savedAt: number;
};
export type StorySaveData = {
  inkStateJson: string;
  visual: VisualState;
};
export interface SaveProvider {
  save(key: string, data: SaveData): Promise<void>;
  load(key: string): Promise<SaveData | null>;
  clear(key: string): Promise<void>;
}
export {};
//# sourceMappingURL=SaveProvider.d.ts.map
