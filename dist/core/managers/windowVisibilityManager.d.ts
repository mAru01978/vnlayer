export declare const messageWindowHiddenAtomFamily: import("jotai-family").AtomFamily<
  string,
  import("jotai").PrimitiveAtom<boolean> & {
    init: boolean;
  }
>;
export declare function setMessageWindowVisible(
  atomKey: string,
  visible: boolean,
): void;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=windowVisibilityManager.d.ts.map
