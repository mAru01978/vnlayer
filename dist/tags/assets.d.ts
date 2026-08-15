export type AssetRegistry<TConfig> = {
    set: (patch: Record<string, TConfig>) => void;
    setResolver: (fn: (key: string) => TConfig | undefined) => void;
    get: (key: string) => TConfig | undefined;
    getAll: () => Record<string, TConfig>;
};
export declare function createAssetRegistry<TConfig>(): AssetRegistry<TConfig>;
//# sourceMappingURL=assets.d.ts.map