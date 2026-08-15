import { type PrimitiveAtom } from "jotai";
import type { ActiveMessage } from "../types";
export declare const activeMessageAtomFamily: import("jotai-family").AtomFamily<
  string,
  PrimitiveAtom<{
    speaker: string;
    content: string;
    fadeIn: boolean;
    typeSpeedMs: number;
    startRevealed?: boolean;
  }>
>;
export declare function setNextRevealFade(
  atomKey: string,
  fadeIn: boolean,
): void;
export declare function showMessage(
  atomKey: string,
  speaker: string,
  content: string,
  typeSpeedMs: number,
): void;
export declare function restoreMessage(
  atomKey: string,
  message: ActiveMessage,
): void;
export declare function setMode(
  atomKey: string,
  mode: "transient" | "persist" | "hide",
  transientDurationMs?: number,
): void;
export declare function clear(atomKey: string): void;
export declare function clearIfSpeakerIs(atomKey: string, name: string): void;
export declare function getActiveMessage(atomKey: string): ActiveMessage | null;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=messageManager.d.ts.map
