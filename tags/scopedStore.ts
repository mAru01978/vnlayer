// configure()の全オプション(ui/assets/tags/webLinks)を、インスタンス単位で
// 個別上書きできるようにするための共通パターン。
//
// 以前はtags/uiConfig.tsだけが「グローバルpatchの上にinstanceIdごとの
// patchを重ねる」設計になっていて、assets/tags/webLinksは常にグローバル
// 共有だった(非対称で不自然、という2026-08-16セッションでの指摘への対応、
// 2.1: configureスコープ統一)。各レジストリ(spriteAssets/animAssets/
// assetsConfig/webLinks/タグ設定)はこれを土台にする。
// tags/uiConfig.ts自体は既存の実装のまま維持している(挙動を変えるリスクを
// 避けるため)が、考え方(パターン)は完全に同じもの。
//
// レジストリごとに「patchのマージ方法(浅いマージか、深いマージか)」が
// 異なるため、merge関数だけを外から注入する形にしてある。
export type ScopedStore<TPatch, TValue> = {
  set: (patch: TPatch, scope?: string) => void;
  get: (scope?: string) => TValue;
  subscribe: (listener: () => void) => () => void;
  getVersion: () => number;
  // セーブ/リストア用(uiConfig.tsのgetAllUiConfigPatches/restoreUiConfigPatches相当)。
  getAllPatches: () => Record<string, TPatch>;
  restorePatches: (patches: Record<string, TPatch> | undefined) => void;
  // 外部の非同期処理(素材URLの解決等、resolveUrlCached()のコールバック等)が
  // 完了した際に、値自体はstore外で別途キャッシュしつつ「変わったこと」だけ
  // 購読者へ通知したい場合に使う(patchを積まずにversionだけ進める)。
  notifyChange: () => void;
};

export const GLOBAL_SCOPE = "__global__";

export function createScopedStore<TPatch, TValue>(options: {
  defaultValue: TValue;
  // グローバル値(またはグローバル+scope分をマージ済みの値)の上に、1つの
  // patchを重ねて実効値を作る。
  mergePatch: (base: TValue, patch: TPatch | undefined) => TValue;
  // 同じscopeへ複数回setされた際、既存patchへ新しいpatchを重ねる
  // (「後から書いた方が勝つ」)。
  mergePatches: (prev: TPatch | undefined, patch: TPatch) => TPatch;
}): ScopedStore<TPatch, TValue> {
  const { defaultValue, mergePatch, mergePatches } = options;
  const patchesByScope = new Map<string, TPatch>();
  let version = 0;
  const listeners = new Set<() => void>();

  function bumpVersion(): void {
    version += 1;
    listeners.forEach((l) => l());
  }

  function computeGlobal(): TValue {
    return mergePatch(defaultValue, patchesByScope.get(GLOBAL_SCOPE));
  }

  return {
    set(patch, scope) {
      const key = scope ?? GLOBAL_SCOPE;
      patchesByScope.set(key, mergePatches(patchesByScope.get(key), patch));
      bumpVersion();
    },
    get(scope) {
      const global = computeGlobal();
      if (!scope) return global;
      return mergePatch(global, patchesByScope.get(scope));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getVersion() {
      return version;
    },
    getAllPatches() {
      return Object.fromEntries(patchesByScope);
    },
    restorePatches(patches) {
      patchesByScope.clear();
      if (patches) {
        for (const [scope, patch] of Object.entries(patches)) {
          patchesByScope.set(scope, patch);
        }
      }
      bumpVersion();
    },
    notifyChange() {
      bumpVersion();
    },
  };
}
