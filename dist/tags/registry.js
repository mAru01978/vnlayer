import { getStore } from "../core/store";
import * as waitManager from "../core/managers/waitManager";
import { reportError, TagDispatchError } from "../core/errors";
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
    entry.config = {
        ...entry.config,
        ...partial,
    };
}
export function getTagConfig(key) {
    return registry.get(key)?.config;
}
// 「認識できるキーだが引数が不正/未対応」の場合の共通警告。以前は各タグが
// handlers.onUnknownTag?.(...)経由で呼んでいたが、これも「状態を書き換える」
// わけではない単なる診断出力なので、handlersから外して直接importできる
// 関数にした。
// 修正メモ: 以前はconsole.warn直書きだったが、core/errors.tsのエラー型
// 階層に寄せた(TagDispatchError)。多くのタグ定義ファイルがこの関数を
// 経由して不正な引数を報告しているため、ここを直すだけで横断的に
// 「タグの引数エラー」がVNLayerError系として一貫した形で報告されるようになる。
export function warnUnknownTag(tag) {
    reportError(new TagDispatchError(`unknown tag or invalid arguments: ${tag}`));
}
export async function runTag(key, args, handlers) {
    const entry = registry.get(key);
    if (!entry) {
        warnUnknownTag(key);
        return;
    }
    await entry.def.run({ args, handlers, config: entry.config });
}
export function registerBasicTag(def) {
    registerTag({
        key: def.key,
        defaultConfig: def.defaultConfig,
        run: async ({ args, config, handlers }) => {
            const store = getStore();
            const targetAtom = def.atomFamily(handlers.atomKey);
            const value = def.resolve(args, config, {
                atomKey: handlers.atomKey,
                instanceId: handlers.instanceId,
                store,
            });
            if (value === undefined)
                return;
            store.set(targetAtom, value);
            const waitMs = def.resolveWaitMs?.(args, config);
            if (waitMs) {
                await waitManager.wait(handlers.atomKey, waitMs);
            }
            const clearAfterMs = def.resolveClearAfterMs?.(args, config);
            if (clearAfterMs !== undefined && def.clearValue !== undefined) {
                setTimeout(() => store.set(targetAtom, def.clearValue), clearAfterMs);
            }
        },
    });
}
//# sourceMappingURL=registry.js.map