import { type PrimitiveAtom } from "jotai";
import type { CamState, ShakeState } from "./types";
export type FlashState = {
    color: string;
    durationMs: number;
} | null;
export declare const camAtomFamily: import("jotai-family").AtomFamily<string, PrimitiveAtom<CamState>>;
export declare const shakeAtomFamily: import("jotai-family").AtomFamily<string, PrimitiveAtom<ShakeState>>;
export declare const flashAtomFamily: import("jotai-family").AtomFamily<string, PrimitiveAtom<{
    color: string;
    durationMs: number;
}>>;
export declare const typeSpeedAtomFamily: import("jotai-family").AtomFamily<string, PrimitiveAtom<number>>;
export declare function resetBasicAtoms(atomKey: string): void;
export declare function disposeBasicAtoms(atomKey: string): void;
//# sourceMappingURL=atoms.d.ts.map