export type ReservedVariablesConfig = {
    characterClick?: boolean;
    errors?: boolean;
};
export declare function setReservedVariablesConfig(patch: ReservedVariablesConfig): void;
export declare function getReservedVariablesConfig(): {
    characterClick: boolean;
    errors: boolean;
};
export declare function getReservedVariableNames(): Set<string>;
//# sourceMappingURL=reservedVariablesConfig.d.ts.map