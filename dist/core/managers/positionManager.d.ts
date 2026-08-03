import type { PositionOverrides } from "../types";
export declare const positionOverridesAtomFamily: import("jotai-family").AtomFamily<
  string,
  import("jotai").PrimitiveAtom<PositionOverrides> & {
    init: PositionOverrides;
  }
>;
export declare function setPos(
  atomKey: string,
  name: string,
  coords:
    | {
        originX: number;
        originY: number;
      }
    | "reset",
  durationMs?: number,
): void;
export declare function getPositionOverrides(
  atomKey: string,
): PositionOverrides;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=positionManager.d.ts.map
