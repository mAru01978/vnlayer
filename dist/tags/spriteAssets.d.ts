import { type ResourceSource } from "../core/ResourceLoader";
export type SpriteVariantConfig = {
    src?: string;
    color?: string;
    source?: ResourceSource;
    resolveLocal?: (path: string) => Promise<unknown>;
};
export type SpriteCharacterConfig = {
    originX?: number;
    originY?: number;
    variants?: Record<string, SpriteVariantConfig>;
};
export declare function subscribeSpriteAssets(listener: () => void): () => void;
export declare function getSpriteAssetsVersion(): number;
export declare function setSpriteAssets(patch: Record<string, SpriteCharacterConfig>): void;
export declare function getCharacterSlot(name: string): {
    originX: number;
    originY: number;
} | undefined;
export declare function getAllCharacterSlots(): Record<string, {
    originX: number;
    originY: number;
}>;
export declare function getBackgroundSlot(bgName: string): {
    color?: string;
    image?: string;
} | undefined;
export declare function getAllBackgroundSlots(): Record<string, {
    color?: string;
    image?: string;
}>;
export declare function resolveSpriteSrc(name: string, variant: string): string | undefined;
export declare function shouldFallbackForSprite(name: string, variant: string): boolean;
//# sourceMappingURL=spriteAssets.d.ts.map