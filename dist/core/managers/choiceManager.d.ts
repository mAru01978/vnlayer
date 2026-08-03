import type { Choice } from "../types";
export declare const choicesAtomFamily: import("jotai-family").AtomFamily<
  string,
  import("jotai").PrimitiveAtom<Choice[]> & {
    init: Choice[];
  }
>;
export declare const choicesHiddenAtomFamily: import("jotai-family").AtomFamily<
  string,
  import("jotai").PrimitiveAtom<boolean> & {
    init: boolean;
  }
>;
export declare function setChoices(atomKey: string, choices: Choice[]): void;
export declare function getChoices(atomKey: string): Choice[];
export declare function setChoicesVisible(
  atomKey: string,
  visible: boolean,
): void;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=choiceManager.d.ts.map
