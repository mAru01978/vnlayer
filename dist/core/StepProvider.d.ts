import type { RunResult } from "./types";
import type { SaveData, StorySaveData } from "./SaveProvider";
export interface StepProvider {
  init(clip: string, atomKey?: string): Promise<RunResult>;
  choose(clip: string, index: number, atomKey?: string): Promise<RunResult>;
  idle(
    clip: string,
    varName: string,
    value: unknown,
    atomKey?: string,
  ): Promise<void>;
  reset(clip: string, atomKey?: string): Promise<RunResult>;
  onPush?(atomKey: string, callback: (result: RunResult) => void): () => void;
  getSaveData?(clip: string, atomKey?: string): Promise<StorySaveData | null>;
  restore?(clip: string, save: SaveData, atomKey?: string): Promise<RunResult>;
}
//# sourceMappingURL=StepProvider.d.ts.map
