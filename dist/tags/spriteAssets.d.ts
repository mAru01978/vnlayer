export type SpriteAssetConfig = {
    src: string;
};
export declare function setSpriteAssets(patch: Record<string, Record<string, SpriteAssetConfig>>): void;
export declare function setSpriteAssetResolver(fn: (characterName: string, expression: string) => SpriteAssetConfig | undefined): void;
export declare function getSpriteAsset(characterName: string, expression: string | undefined): SpriteAssetConfig | undefined;
export declare function getAllSpriteAssets(): Record<string, SpriteAssetConfig>;
//# sourceMappingURL=spriteAssets.d.ts.map