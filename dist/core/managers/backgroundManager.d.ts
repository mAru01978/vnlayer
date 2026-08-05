export declare const bgAtomFamily: import("jotai-family").AtomFamily<string, import("jotai").PrimitiveAtom<string> & {
    init: string;
}>;
export declare function setBackground(atomKey: string, instanceId: string | undefined, name: string): void;
export declare function restoreBackground(atomKey: string, name: string): void;
export declare function getBackground(atomKey: string): string;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=backgroundManager.d.ts.map