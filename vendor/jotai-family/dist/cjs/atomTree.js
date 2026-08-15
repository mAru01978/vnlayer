"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atomTree = atomTree;
/**
 * Creates a hierarchical structure of Jotai atoms.
 *
 * @template AtomType - The type of atom returned by the initialization function.
 * @param initializePathAtom - A function that takes a path array and returns an Atom.
 * @returns A function for creating and managing hierarchical atoms (with additional methods).
 */
function atomTree(initializePathAtom) {
    const root = {};
    const defaultPath = [];
    /**
     * Creates or retrieves an atom at the specified path in the hierarchy.
     *
     * @param path - Array of keys representing the location in the hierarchy.
     * @returns The Jotai atom for the specified path.
     */
    const createAtom = (path) => {
        var _a, _b;
        let node = root;
        for (const key of path) {
            (_a = node.children) !== null && _a !== void 0 ? _a : (node.children = new Map());
            if (!node.children.has(key)) {
                node.children.set(key, {});
            }
            node = node.children.get(key);
        }
        (_b = node.atom) !== null && _b !== void 0 ? _b : (node.atom = initializePathAtom(path));
        return node.atom;
    };
    /**
     * Removes an atom (and optionally its subtree) at the specified path.
     *
     * @param path - Array of keys representing the location in the hierarchy. Defaults to [] (root).
     * @param removeSubTree - If true, removes all children of that path as well. Defaults to false.
     * @throws Error if the path does not exist.
     */
    createAtom.remove = (path = defaultPath, removeSubTree = false) => {
        var _a;
        const nodePath = createAtom.getNodePath(path);
        const node = nodePath[nodePath.length - 1];
        delete node.atom;
        if (removeSubTree) {
            delete node.children;
        }
        // delete empty subtrees from bottom to top
        for (let i = nodePath.length - 1; i >= 0; i--) {
            const node = nodePath[i];
            if (!((_a = node.children) === null || _a === void 0 ? void 0 : _a.size) && i > 0) {
                const parentNode = nodePath[i - 1];
                parentNode.children.delete(path[i]);
                if (!parentNode.children.size) {
                    delete parentNode.children;
                }
            }
            else {
                break;
            }
        }
    };
    /**
     * Retrieves the internal node (subtree) at a specified path.
     *
     * @param path - Array of keys representing the location in the hierarchy. Defaults to [] (root).
     * @returns A Node object with possible `children` and `atom`.
     * @throws Error if the path does not exist.
     */
    createAtom.getSubTree = (path = defaultPath) => {
        var _a;
        let node = root;
        for (const key of path) {
            node = (_a = node.children) === null || _a === void 0 ? void 0 : _a.get(key);
            if (!node) {
                throw new Error('Path does not exist');
            }
        }
        return node;
    };
    /**
     * Retrieves the internal node (subtree) at a specified path.
     *
     * @param path - Array of keys representing the location in the hierarchy. Defaults to [] (root).
     * @returns An array of Node objects representing the path.
     * @throws Error if the path does not exist.
     */
    createAtom.getNodePath = (path = defaultPath) => {
        var _a;
        const nodePath = [root];
        let node = root;
        for (const key of path) {
            node = (_a = node.children) === null || _a === void 0 ? void 0 : _a.get(key);
            if (!node) {
                throw new Error('Path does not exist');
            }
            nodePath.push(node);
        }
        return nodePath;
    };
    return createAtom;
}
//# sourceMappingURL=atomTree.js.map