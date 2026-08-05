export function createAssetRegistry() {
    let table = {};
    let resolver;
    return {
        set(patch) {
            table = { ...table, ...patch };
        },
        setResolver(fn) {
            resolver = fn;
        },
        get(key) {
            return table[key] ?? resolver?.(key);
        },
        getAll() {
            return table;
        },
    };
}
//# sourceMappingURL=assets.js.map