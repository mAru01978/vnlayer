export type CharacterSlot = {
    originX: number;
    originY: number;
};
export declare function setCharacterSlots(next: Record<string, CharacterSlot>): void;
export declare function getCharacterSlot(name: string): CharacterSlot | undefined;
export declare function getAllCharacterSlots(): Record<string, CharacterSlot>;
//# sourceMappingURL=characterSlots.d.ts.map