// #web:open / #web:goto で「完全に別サイトへ行く」場合に参照する、
// 許可済みリンクのホワイトリスト。
//
// scope対応(2.1: configureスコープ統一): tags/scopedStore.tsの共通パターンに
// 乗せた。VNLayer.configure({ webLinks: {...} })はselectorを渡さなければ
// 今まで通り全VN共通、selectorを渡すとそのインスタンス専用のリンク表を
// 追加できる(グローバルのリンク表はそのまま生きていて、そちらにも無ければ
// 最終的に見つからない扱いになる)。
//
// 重要な副産物: inkのソースファイルは "//" を行コメントの開始として扱うため、
// # web:open:https://example.com のようにURLを直接タグに書くと、
// //以降がinkコンパイラの時点でコメントとして消えてしまい、
// 壊れたURL(例: "https:"だけ)になってしまう。
// これを回避するため、ink側には常に「名前(キー)」だけを書かせ、
// 実際のURLはJS側(VNLayer.configure({ webLinks: {...} }))で登録する
// 設計にした。副次効果として、ink側からは登録されていない任意の外部URLへは
// 行けなくなる(ホワイトリスト化)。
import { createScopedStore } from "./scopedStore";

export type WebLinksPatch = Record<string, string>;

const store = createScopedStore<WebLinksPatch, WebLinksPatch>({
  defaultValue: {},
  mergePatch: (base, patch) => (patch ? { ...base, ...patch } : base),
  mergePatches: (prev, patch) => ({ ...prev, ...patch }),
});

export function setWebLinks(patch: WebLinksPatch, scope?: string): void {
  store.set(patch, scope);
}

export function getWebLink(key: string, scope?: string): string | undefined {
  return store.get(scope)[key];
}

export function getAllWebLinksPatches(): Record<string, WebLinksPatch> {
  return store.getAllPatches();
}
export function restoreWebLinksPatches(
  patches: Record<string, WebLinksPatch> | undefined,
): void {
  store.restorePatches(patches);
}
