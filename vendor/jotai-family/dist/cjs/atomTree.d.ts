import type { Atom } from "jotai/vanilla";
type Node<AtomType extends Atom<unknown> = Atom<unknown>> = {
  children?: Map<unknown, Node<AtomType>>;
  atom?: AtomType;
};
type AtomTree<
  Path extends readonly unknown[],
  AtomType extends Atom<unknown>,
> = {
  (path: Path): AtomType;
  remove(path?: Path, removeSubTree?: boolean): void;
  getSubTree(path?: Path): Node<AtomType>;
  getNodePath(path?: Path): Node<AtomType>[];
};
/**
 * Creates a hierarchical structure of Jotai atoms.
 *
 * @template AtomType - The type of atom returned by the initialization function.
 * @param initializePathAtom - A function that takes a path array and returns an Atom.
 * @returns A function for creating and managing hierarchical atoms (with additional methods).
 */
export declare function atomTree<
  Path extends readonly unknown[],
  AtomType extends Atom<unknown>,
>(initializePathAtom: (path: Path) => AtomType): AtomTree<Path, AtomType>;
export {};
//# sourceMappingURL=atomTree.d.ts.map
