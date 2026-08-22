export type ScopedStore<TPatch, TValue> = {
    set: (patch: TPatch, scope?: string) => void;
    get: (scope?: string) => TValue;
    subscribe: (listener: () => void) => () => void;
    getVersion: () => number;
    getAllPatches: () => Record<string, TPatch>;
    restorePatches: (patches: Record<string, TPatch> | undefined) => void;
    notifyChange: () => void;
};
export declare const GLOBAL_SCOPE = "__global__";
export declare function createScopedStore<TPatch, TValue>(options: {
    defaultValue: TValue;
    mergePatch: (base: TValue, patch: TPatch | undefined) => TValue;
    mergePatches: (prev: TPatch | undefined, patch: TPatch) => TPatch;
}): ScopedStore<TPatch, TValue>;
//# sourceMappingURL=scopedStore.d.ts.map