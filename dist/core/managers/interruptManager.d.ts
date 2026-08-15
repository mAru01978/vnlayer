import type { Story } from "inkjs";
import type { RunResult, VisualState } from "../types";
export type InterruptHost = {
    story: Story;
    getVisual: () => VisualState;
    setVisual: (visual: VisualState) => void;
    pushResult: (result: RunResult) => void;
};
export declare function attachStory(atomKey: string, host: InterruptHost): void;
export declare function registerPermission(atomKey: string, knot: string, varName: string): void;
export declare function clearAll(atomKey: string): void;
export declare function clearVar(atomKey: string, varName: string): void;
export declare function finishFlowIfDone(atomKey: string, story: Story, result: RunResult): RunResult;
export declare const resumeDefaultFlowIfInterruptFinished: typeof finishFlowIfDone;
export declare function isInterrupting(atomKey: string): boolean;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=interruptManager.d.ts.map