import type { SetContextKeyNames, SetContextOptions } from "../types";
export type ContextSyncHost = {
    observeVariable: (varName: string, onChange: (value: unknown) => void) => void;
};
export declare function flattenVars(vars: Record<string, unknown>, keyNames?: SetContextKeyNames, prefix?: string): Record<string, unknown>;
export declare function attachStory(atomKey: string, host: ContextSyncHost): void;
export declare function prepareWrite(atomKey: string, vars: Record<string, unknown>, options?: SetContextOptions): Record<string, unknown>;
export declare function getContextVars(atomKey: string, varNames?: string[]): Record<string, unknown>;
export declare function hydrate(atomKey: string, vars: Record<string, unknown>): void;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=contextManager.d.ts.map