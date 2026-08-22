export const GLOBAL_SCOPE = "__global__";
export function createScopedStore(options) {
    const { defaultValue, mergePatch, mergePatches } = options;
    const patchesByScope = new Map();
    let version = 0;
    const listeners = new Set();
    function bumpVersion() {
        version += 1;
        listeners.forEach((l) => l());
    }
    function computeGlobal() {
        return mergePatch(defaultValue, patchesByScope.get(GLOBAL_SCOPE));
    }
    return {
        set(patch, scope) {
            const key = scope ?? GLOBAL_SCOPE;
            patchesByScope.set(key, mergePatches(patchesByScope.get(key), patch));
            bumpVersion();
        },
        get(scope) {
            const global = computeGlobal();
            if (!scope)
                return global;
            return mergePatch(global, patchesByScope.get(scope));
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        getVersion() {
            return version;
        },
        getAllPatches() {
            return Object.fromEntries(patchesByScope);
        },
        restorePatches(patches) {
            patchesByScope.clear();
            if (patches) {
                for (const [scope, patch] of Object.entries(patches)) {
                    patchesByScope.set(scope, patch);
                }
            }
            bumpVersion();
        },
        notifyChange() {
            bumpVersion();
        },
    };
}
//# sourceMappingURL=scopedStore.js.map