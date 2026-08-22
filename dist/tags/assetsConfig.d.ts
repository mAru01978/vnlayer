import type { ResourceSource } from "../core/ResourceLoader";
export type AssetsGlobalConfig = {
    basePath?: string;
    source?: ResourceSource;
    resolveLocal?: (path: string) => Promise<unknown>;
    fallbackToMock?: boolean;
    spriteExtension?: string;
    animExtension?: string;
};
export declare function subscribeAssetsConfig(listener: () => void): () => void;
export declare function getAssetsConfigVersion(): number;
export declare function setAssetsConfig(patch: AssetsGlobalConfig, scope?: string): void;
export declare function getAssetsConfig(scope?: string): AssetsGlobalConfig;
export declare function getAllAssetsConfigPatches(): Record<string, AssetsGlobalConfig>;
export declare function restoreAssetsConfigPatches(patches: Record<string, AssetsGlobalConfig> | undefined): void;
export declare function shouldFallbackToMock(context: string, scope?: string): boolean;
//# sourceMappingURL=assetsConfig.d.ts.map