import type { RunResult } from "./types";
export interface StepProvider {
    init(scenario: string): Promise<RunResult>;
    choose(scenario: string, index: number): Promise<RunResult>;
    idle(scenario: string, varName: string, value: unknown): Promise<void>;
    reset(scenario: string): Promise<RunResult>;
}
//# sourceMappingURL=StepProvider.d.ts.map