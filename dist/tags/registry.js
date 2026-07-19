// タグごとに「設定値(config)」と「処理内容(run)」を1ファイルにまとめて登録する仕組み。
// scripts/new-tag.js が今後 tags/defs/<タグ名>.ts を1個生成するだけで済むようにする狙い。
//
// VNLayer.configure({ tags: { cam: { scales: {...} } } }) のように、Next.js側からも
// vnlayer.js(静的バンドル)側からも同じ setTagConfig 経由で上書きできる。
const registry = new Map();
export function registerTag(def) {
    registry.set(def.key, {
        def,
        config: def.defaultConfig !== undefined ? { ...def.defaultConfig } : undefined,
    });
}
// 既存タグの設定を部分的に上書きする(浅いマージ)。
export function setTagConfig(key, partial) {
    const entry = registry.get(key);
    if (!entry) {
        console.warn(`[VNLayer] setTagConfig: unknown tag "${key}"`);
        return;
    }
    entry.config = { ...entry.config, ...partial };
}
export function getTagConfig(key) {
    return registry.get(key)?.config;
}
export async function runTag(key, args, handlers) {
    const entry = registry.get(key);
    if (!entry) {
        handlers.onUnknownTag?.([key, ...args].join(':'));
        console.warn('[VNLayer] unknown tag:', key);
        return;
    }
    await entry.def.run({ args, handlers, config: entry.config });
}
//# sourceMappingURL=registry.js.map