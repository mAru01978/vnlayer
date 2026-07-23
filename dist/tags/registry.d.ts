import type { SceneHandlers } from './sceneHandlers';
export type TagRunContext<TConfig> = {
    args: string[];
    handlers: SceneHandlers;
    config: TConfig;
};
export type TagDefinition<TConfig = any> = {
    key: string;
    defaultConfig?: TConfig;
    run: (ctx: TagRunContext<TConfig>) => Promise<void> | void;
};
export declare function registerTag<TConfig>(def: TagDefinition<TConfig>): void;
export declare function registerAlias(alias: string, canonicalKey: string): void;
export declare function setTagConfig(key: string, partial: Record<string, unknown>): void;
export declare function getTagConfig<T = any>(key: string): T | undefined;
export declare function runTag(key: string, args: string[], handlers: SceneHandlers): Promise<void>;
//# sourceMappingURL=registry.d.ts.map