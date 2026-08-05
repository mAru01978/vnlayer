export type EmitTarget = {
    setContextVars: (vars: Record<string, unknown>, options?: {
        notify?: boolean;
        expose?: boolean;
    }) => Promise<void>;
};
export declare function registerInstance(selector: string, target: EmitTarget): void;
export declare function unregisterInstance(selector: string): void;
export declare function emitToInstance(selector: string, vars: Record<string, unknown>, options?: {
    notify?: boolean;
    expose?: boolean;
}): Promise<void>;
//# sourceMappingURL=instanceRegistry.d.ts.map