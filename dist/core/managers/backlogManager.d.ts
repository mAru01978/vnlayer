import type { LineEntry } from "../types";
export declare const linesAtomFamily: import("jotai-family").AtomFamily<string, import("jotai").PrimitiveAtom<LineEntry[]> & {
    init: LineEntry[];
}>;
export declare function pushLine(atomKey: string, instanceId: string | undefined, speaker: string, content: string): void;
export declare function pushChoice(atomKey: string, instanceId: string | undefined, number: number, text: string): void;
export declare function getLines(atomKey: string): LineEntry[];
export declare function clear(atomKey: string, instanceId: string | undefined): void;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=backlogManager.d.ts.map