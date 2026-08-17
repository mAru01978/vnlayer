import type { SaveProvider } from "../SaveProvider";
export type CookieSaveProviderOptions = {
    keyPrefix?: string;
    maxAgeDays?: number;
};
export declare function createCookieSaveProvider(options?: CookieSaveProviderOptions): SaveProvider;
//# sourceMappingURL=cookieSaveProvider.d.ts.map