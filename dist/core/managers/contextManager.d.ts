export declare function prepareWrite(
  atomKey: string,
  vars: Record<string, unknown>,
  options?: {
    notify?: boolean;
    expose?: boolean;
  },
): Record<string, unknown>;
export declare function getContextVars(
  atomKey: string,
  varNames?: string[],
): Record<string, unknown>;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=contextManager.d.ts.map
