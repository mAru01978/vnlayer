export type ResourceSource = "local" | "fetch";
export type ResourceLoaderOptions = {
  source?: ResourceSource;
  basePath?: string;
  resolveLocal?: (path: string) => Promise<unknown>;
};
export declare function loadJson<T>(
  path: string,
  options?: ResourceLoaderOptions,
): Promise<T>;
export declare function resolveUrl(
  path: string,
  options?: ResourceLoaderOptions,
): Promise<string>;
export declare function resolveUrlCached(
  cacheKey: string,
  path: string,
  options: ResourceLoaderOptions,
  onResolved: () => void,
): string | undefined;
export declare function clearResolvedUrlCache(cacheKeyPrefix?: string): void;
//# sourceMappingURL=ResourceLoader.d.ts.map
