export function createLocalStorageSaveProvider(options = {}) {
    const prefix = options.keyPrefix ?? "vnlayer:save:";
    function storageKey(key) {
        return `${prefix}${key}`;
    }
    function hasStorage() {
        try {
            return (typeof window !== "undefined" &&
                typeof window.localStorage !== "undefined");
        }
        catch {
            // Safariのプライベートブラウズ等、localStorageへのアクセス自体が
            // 例外を投げる環境がある。
            return false;
        }
    }
    return {
        async save(key, data) {
            if (!hasStorage())
                return;
            try {
                window.localStorage.setItem(storageKey(key), JSON.stringify(data));
            }
            catch (e) {
                console.warn("[VNLayer] localStorage save failed (quota exceeded, or private mode?):", e);
            }
        },
        async load(key) {
            if (!hasStorage())
                return null;
            const raw = window.localStorage.getItem(storageKey(key));
            if (!raw)
                return null;
            try {
                return JSON.parse(raw);
            }
            catch (e) {
                console.warn("[VNLayer] localStorage save data corrupted, ignoring:", e);
                return null;
            }
        },
        async clear(key) {
            if (!hasStorage())
                return;
            window.localStorage.removeItem(storageKey(key));
        },
    };
}
//# sourceMappingURL=localStorageSaveProvider.js.map