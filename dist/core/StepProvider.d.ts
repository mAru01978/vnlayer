import type { RunResult } from "./types";
export interface StepProvider {
    init(scenario: string, atomKey?: string): Promise<RunResult>;
    choose(scenario: string, index: number, atomKey?: string): Promise<RunResult>;
    idle(scenario: string, varName: string, value: unknown, atomKey?: string): Promise<void>;
    reset(scenario: string, atomKey?: string): Promise<RunResult>;
    onPush?(atomKey: string, callback: (result: RunResult) => void): () => void;
}
//# sourceMappingURL=StepProvider.d.ts.map