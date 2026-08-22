export type TagHandlers = {
    atomKey: string;
    instanceId?: string;
};
import type { PrimitiveAtom } from "jotai";
import { getStore } from "../core/store";
export type TagRunContext<TConfig> = {
    args: string[];
    handlers: TagHandlers;
    config: TConfig;
};
export type TagDefinition<TConfig = any> = {
    key: string;
    defaultConfig?: TConfig;
    run: (ctx: TagRunContext<TConfig>) => Promise<void> | void;
};
export declare function registerTag<TConfig>(def: TagDefinition<TConfig>): void;
export declare function registerAlias(alias: string, canonicalKey: string): void;
export declare function setTagConfig(key: string, partial: Record<string, unknown>, scope?: string): void;
export declare function getTagConfig<T = any>(key: string, scope?: string): T | undefined;
export declare function warnUnknownTag(tag: string): void;
export declare function runTag(key: string, args: string[], handlers: TagHandlers): Promise<void>;
export type BasicTagRunHelpers = {
    atomKey: string;
    instanceId?: string;
    store: ReturnType<typeof getStore>;
};
export type BasicTagDefinition<TConfig, TValue> = {
    key: string;
    defaultConfig?: TConfig;
    atomFamily: (atomKey: string) => PrimitiveAtom<TValue>;
    resolve: (args: string[], config: TConfig, helpers: BasicTagRunHelpers) => TValue | undefined;
    resolveWaitMs?: (args: string[], config: TConfig) => number | undefined;
    resolveClearAfterMs?: (args: string[], config: TConfig) => number | undefined;
    clearValue?: TValue;
};
export declare function registerBasicTag<TConfig, TValue>(def: BasicTagDefinition<TConfig, TValue>): void;
//# sourceMappingURL=registry.d.ts.map