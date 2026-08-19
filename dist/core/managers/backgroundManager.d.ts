export declare const bgAtomFamily: import("jotai-family").AtomFamily<string, import("jotai").PrimitiveAtom<string> & {
    init: string;
}>;
export declare const bgZIndexAtomFamily: import("jotai-family").AtomFamily<string, import("jotai").PrimitiveAtom<number> & {
    init: number;
}>;
export declare function setBackground(atomKey: string, instanceId: string | undefined, name: string): void;
export declare function restoreBackground(atomKey: string, name: string, zIndex?: number): void;
export declare function getBackground(atomKey: string): string;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
export declare function setBackgroundZIndex(atomKey: string, zIndex: number): void;
export declare function getBackgroundZIndex(atomKey: string): number | undefined;
//# sourceMappingURL=backgroundManager.d.ts.map