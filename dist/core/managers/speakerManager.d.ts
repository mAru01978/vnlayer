export declare const speakerAtomFamily: import("jotai-family").AtomFamily<
  string,
  import("jotai").PrimitiveAtom<string> & {
    init: string;
  }
>;
export declare function setSpeaker(atomKey: string, name: string): void;
export declare function getSpeaker(atomKey: string): string;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=speakerManager.d.ts.map
