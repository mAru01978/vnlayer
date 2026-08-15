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
export declare function setAssetsConfig(patch: AssetsGlobalConfig): void;
export declare function getAssetsConfig(): AssetsGlobalConfig;
export declare function shouldFallbackToMock(context: string): boolean;
//# sourceMappingURL=assetsConfig.d.ts.map
