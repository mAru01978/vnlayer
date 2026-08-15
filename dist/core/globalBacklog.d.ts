import type { LineEntry } from "./types";
export type GlobalLineEntry = LineEntry & {
  instanceId?: string;
  seq: number;
};
export declare function pushGlobalBacklogEntry(
  entry: LineEntry,
  instanceId?: string,
): void;
export declare function clearGlobalBacklog(): void;
export declare function getGlobalBacklogEntries(): GlobalLineEntry[];
export declare function subscribeGlobalBacklog(
  listener: () => void,
): () => void;
//# sourceMappingURL=globalBacklog.d.ts.map
