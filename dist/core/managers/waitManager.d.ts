export declare function beginBatch(atomKey: string): number;
export declare function isStale(atomKey: string, generation: number): boolean;
export declare function getCurrentGeneration(atomKey: string): number;
export declare function wait(atomKey: string, ms: number): Promise<void>;
export declare function interrupt(atomKey: string): void;
export declare function consumePendingInterrupt(atomKey: string): boolean;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=waitManager.d.ts.map
