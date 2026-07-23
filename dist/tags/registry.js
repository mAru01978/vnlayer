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
// タグの短縮エイリアスを登録する(例: registerAlias('c', 'cam'))。
// エイリアス側もsetTagConfig/getTagConfigで同じ実体(RegistryEntry)を
// 共有するので、設定の上書きはどちらの名前でアクセスしても一致する。
// 頭文字が他のタグと衝突する場合は登録しない(例: #s は既にspeaker/sprite用
// タグそのものなので、他のタグに's'エイリアスを与えることはできない)。
export function registerAlias(alias, canonicalKey) {
    const entry = registry.get(canonicalKey);
    if (!entry) {
        console.warn(`[VNLayer] registerAlias: unknown canonical tag "${canonicalKey}" for alias "${alias}"`);
        return;
    }
    if (registry.has(alias)) {
        console.warn(`[VNLayer] registerAlias: alias "${alias}" is already taken, skipping`);
        return;
    }
    registry.set(alias, entry);
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