import type { RunResult } from "./types";
export interface StepProvider {
    init(clip: string, atomKey?: string): Promise<RunResult>;
    choose(clip: string, index: number, atomKey?: string): Promise<RunResult>;
    idle(clip: string, varName: string, value: unknown, atomKey?: string): Promise<void>;
    reset(clip: string, atomKey?: string): Promise<RunResult>;
    onPush?(atomKey: string, callback: (result: RunResult) => void): () => void;
}
//# sourceMappingURL=StepProvider.d.ts.map