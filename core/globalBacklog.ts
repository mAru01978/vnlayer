// #ui:backlog:mode:global 用の「全VN共通の統合バックログ」実体。
//
// characterSlots.ts/backgroundSlots.tsと同じ「モジュールスコープの単純な
// 共有ストア」パターンを踏襲しつつ、Reactコンポーネント側が変更を検知できる
// よう、購読(subscribe)機構だけ追加してある(components/StageView.tsx側は
// useSyncExternalStoreでこれを購読する)。
//
// 書き込みはcore/managers/backlogManager.tsが担当する。実効UI設定
// (getUiConfig(instanceId).backlog.mode)が'global'の時だけ、通常の
// バックログ(そのインスタンス専用のlinesAtomFamily)への追記と同時に
// ここへも追記する。'perInstance'のインスタンスからは一切書き込まれない
// (=global表示に混ざらない)。
//
// 注意: 「どのVNインスタンスから来たログか」が分かるようinstanceId(公開
// スコープ識別子)を付与してあるが、mode:'global'なインスタンス同士は
// 原則同じ会話を共有する用途を想定しているため、StageView側では既定で
// 全件そのまま表示する(instanceIdでのフィルタリングはしない)。
import type { LineEntry } from "./types";

export type GlobalLineEntry = LineEntry & { instanceId?: string; seq: number };

let entries: GlobalLineEntry[] = [];
let seq = 0;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function pushGlobalBacklogEntry(
  entry: LineEntry,
  instanceId?: string,
): void {
  seq += 1;
  entries = [...entries, { ...entry, instanceId, seq }];
  notify();
}

// #ui:backlog:clear がmode:'global'のインスタンスから呼ばれた時用。
// 全VN共通のログなので、どのインスタンスから呼んでも全体をクリアする。
export function clearGlobalBacklog(): void {
  entries = [];
  notify();
}

export function getGlobalBacklogEntries(): GlobalLineEntry[] {
  return entries;
}

export function subscribeGlobalBacklog(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
