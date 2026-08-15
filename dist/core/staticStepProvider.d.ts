import type { StepProvider } from "./StepProvider";
import { type ResourceSource } from "./ResourceLoader";
export type StaticStepProviderOptions = {
    dataBaseUrl?: string;
    source?: ResourceSource;
    resolveLocal?: (path: string) => Promise<unknown>;
};
export declare function createStaticStepProvider(options?: StaticStepProviderOptions): StepProvider;
//# sourceMappingURL=staticStepProvider.d.ts.map