export type AnimAssetConfig = {
    mode: 'sequence';
    frames: string[];
    fps?: number;
} | {
    mode: 'single';
    src: string;
};
export declare function setAnimAssets(patch: Record<string, Record<string, AnimAssetConfig>>): void;
export declare function setAnimAssetResolver(fn: (characterName: string, expression: string, motion: string) => AnimAssetConfig | undefined): void;
export declare function getAnimAsset(characterName: string, expression: string | undefined, motion: string | undefined): AnimAssetConfig | undefined;
export declare function getAllAnimAssets(): Record<string, AnimAssetConfig>;
//# sourceMappingURL=animAssets.d.ts.map