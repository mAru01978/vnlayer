import type { CharacterState } from "../types";
export declare const charactersAtomFamily: import("jotai-family").AtomFamily<string, import("jotai").PrimitiveAtom<Record<string, CharacterState>> & {
    init: Record<string, CharacterState>;
}>;
export declare function setExpression(atomKey: string, name: string, expression: string): void;
export declare function setAnimMotion(atomKey: string, name: string, motion: string): void;
export declare function setAnimLoop(atomKey: string, name: string, motion: string): void;
export declare function setAnimStop(atomKey: string, name: string): void;
export declare function setAnimSpeed(atomKey: string, name: string, speed: number): void;
export declare function setAnimReverse(atomKey: string, name: string, motion: string): void;
export declare function setGaze(atomKey: string, name: string, target: {
    x: number;
    y: number;
} | "reset"): void;
export declare function hideCharacter(atomKey: string, instanceId: string | undefined, name: string): void;
export declare function getCharacters(atomKey: string): Record<string, CharacterState>;
export declare function mergeVisualSnapshot(atomKey: string, visualCharacters: Record<string, CharacterState>): void;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
export declare function setZIndex(atomKey: string, name: string, zIndex: number): void;
//# sourceMappingURL=characterManager.d.ts.map