import { type ResourceSource } from "../core/ResourceLoader";
export type AnimAssetConfig = {
    mode: "sequence";
    frames: string[];
    fps?: number;
    source?: ResourceSource;
    resolveLocal?: (path: string) => Promise<unknown>;
} | {
    mode: "single";
    src?: string;
    source?: ResourceSource;
    resolveLocal?: (path: string) => Promise<unknown>;
};
export declare function subscribeAnimAssets(listener: () => void): () => void;
export declare function getAnimAssetsVersion(): number;
export declare function setAnimAssets(patch: Record<string, Record<string, AnimAssetConfig>>, scope?: string): void;
export declare function setAnimAssetResolver(fn: (characterName: string, expression: string, motion: string) => AnimAssetConfig | undefined): void;
export declare function getAnimAsset(characterName: string, expression: string | undefined, motion: string | undefined, scope?: string): AnimAssetConfig | undefined;
export declare function getAllAnimAssets(scope?: string): Record<string, AnimAssetConfig>;
export declare function shouldFallbackForAnim(name: string, motion: string, scope?: string): boolean;
//# sourceMappingURL=animAssets.d.ts.map