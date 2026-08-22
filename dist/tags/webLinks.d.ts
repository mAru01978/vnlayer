export type WebLinksPatch = Record<string, string>;
export declare function setWebLinks(patch: WebLinksPatch, scope?: string): void;
export declare function getWebLink(key: string, scope?: string): string | undefined;
export declare function getAllWebLinksPatches(): Record<string, WebLinksPatch>;
export declare function restoreWebLinksPatches(patches: Record<string, WebLinksPatch> | undefined): void;
//# sourceMappingURL=webLinks.d.ts.map