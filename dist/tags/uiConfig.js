// メッセージウィンドウ/選択肢/バックログ/キャラの見た目・挙動をVNごとに
// 差し替えるための共有ストア。
//
// notify()/setContext()と同じ考え方でスコープ指定できるようにしてある:
//   setUiConfig(patch)              → 全VN共通(グローバル)に適用
//   setUiConfig(patch, "#vn")       → "#vn"のVNだけに適用(グローバル設定の上に重なる)
// 未指定(グローバル)がまず土台になり、スコープ指定した値だけがその
// インスタンスの表示に追加で反映される、という「グローバルが既定、
// 個別指定は上書き」の関係。
//
// characterSlots.tsと同じく、JS(VNLayer.configure)からもInk(#ui:...タグ、
// 内部的にはhandlers.setUiConfig経由)からも同じ関数を共有していて、
// 後から書いた方が「そのスコープの中では」勝つ(優先度判定は無い)。
//
// 真偽値は全てon/off(boolean)で統一している。true/falseという値そのものは
// タグの引数としては使わない(タグ設計方針: 数値・小数・意味のあるラベルのみ)。
//
// リアクティブ化(2026-08-08、簡易セーブ機能追加に伴う修正): 以前はここが
// 素朴なモジュールスコープのMapで、Reactの再描画を一切トリガーしなかった。
// 通常再生では大量のタグ処理(=多くのJotai atom書き込み=多くの再描画)が
// 連鎖するため気づきにくかったが、簡易セーブからの復元(steps=[]でatom
// 書き込みが最小限)や、mount後に非同期でVNLayer.configure({ui:...})を
// 呼ぶケースでは「値は更新されているのに画面に反映されない/後から
// 突然反映される」ような挙動として表面化していた。version番号+
// useSyncExternalStore(components/StageView.tsx側)で解決する。
const defaultUiConfig = {
  messageWindow: {
    interactive: true,
    offset: 130,
    autoHideOnCharHide: true,
    autoHideOnBgChange: true,
  },
  choice: {
    spacing: 8,
    anchor: undefined,
    offset: 130,
    interactive: true,
    autoClearOnChoose: true,
  },
  backlog: {
    mode: "perInstance",
    show: true,
    anchor: undefined,
    offset: undefined,
  },
  character: { clickable: true },
  font: {},
  stage: { stickToViewport: true, heightPx: undefined, widthPx: undefined },
};
const GLOBAL_SCOPE = "__global__";
// スコープ(グローバルは特別なキー、インスタンス別は選択肢文字列そのまま)ごとに
// 「差分(patch)」だけを保持する。フルの設定値ではなく差分で持つことで、
// 「そのスコープで明示的に設定した項目だけ」がグローバルの上に重なるようにする。
const patchesByScope = new Map();
// リアクティブ化用: setUiConfig()/restoreUiConfigPatches()が呼ばれるたびに
// version(単調増加のバージョン番号)を進める。components/StageView.tsx側は
// useSyncExternalStore(subscribeUiConfig, getUiConfigVersion, ...)を呼ぶことで
// 「値そのもの」ではなく「変わったかどうか」だけを購読し、変化があれば
// 再描画される(getUiConfig()自体は毎回新しいオブジェクトを組み立てて返す
// 関数のままなので、useSyncExternalStoreのgetSnapshotに直接使うと参照が
// 毎回変わってしまい相性が悪いため、version番号を経由する形にしている)。
let version = 0;
const listeners = new Set();
function bumpVersion() {
  version += 1;
  listeners.forEach((listener) => listener());
}
export function subscribeUiConfig(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getUiConfigVersion() {
  return version;
}
function mergeSection(base, patch) {
  return patch ? { ...base, ...patch } : base;
}
function mergePatch(base, patch) {
  if (!patch) return base;
  return {
    messageWindow: mergeSection(base.messageWindow, patch.messageWindow),
    choice: mergeSection(base.choice, patch.choice),
    backlog: mergeSection(base.backlog, patch.backlog),
    character: mergeSection(base.character, patch.character),
    font: mergeSection(base.font, patch.font),
    stage: mergeSection(base.stage, patch.stage),
  };
}
function computeGlobal() {
  return mergePatch(defaultUiConfig, patchesByScope.get(GLOBAL_SCOPE));
}
// scopeを省略(またはundefined)するとグローバル設定を更新する
// (=すべてのVNインスタンスに影響する既定値)。
// scopeにセレクタ文字列("#vn"等)を渡すと、そのインスタンスだけの
// 上書き設定として記録される(グローバル設定はそのまま、他のVNには影響しない)。
export function setUiConfig(patch, scope) {
  const key = scope ?? GLOBAL_SCOPE;
  const existing = patchesByScope.get(key) ?? {};
  patchesByScope.set(key, {
    messageWindow: { ...existing.messageWindow, ...patch.messageWindow },
    choice: { ...existing.choice, ...patch.choice },
    backlog: { ...existing.backlog, ...patch.backlog },
    character: { ...existing.character, ...patch.character },
    font: { ...existing.font, ...patch.font },
    stage: { ...existing.stage, ...patch.stage },
  });
  bumpVersion();
}
// scopeを省略するとグローバル設定(全VN共通の既定値)を返す。
// scopeを指定すると、グローバル設定の上にそのインスタンス専用の上書きを
// 重ねた「実効設定」を返す(そのインスタンス専用の上書きが無い項目は
// グローバルの値がそのまま使われる)。
export function getUiConfig(scope) {
  const global = computeGlobal();
  if (!scope) return global;
  return mergePatch(global, patchesByScope.get(scope));
}
// 簡易セーブ機能(core/SaveProvider.ts)用。#ui:...タグが積み上げてきた
// 全スコープぶんのpatchをそのまま取り出す/丸ごと置き換える。
// ToJson/LoadJson(inkjs自身の実行状態)には含まれない「VNLayer側の見た目
// 設定」の一部なので、これを保存/復元しないと、保存時点までにストーリーが
// 辿ったタグ(#ui:font:.../#ui:choice:anchor:...等)の効果が復元後に
// 失われてしまう(フォントが既定に戻る、選択肢の位置がおかしくなる、
// といった不具合の原因だった)。
export function getAllUiConfigPatches() {
  return Object.fromEntries(patchesByScope);
}
export function restoreUiConfigPatches(patches) {
  patchesByScope.clear();
  if (patches) {
    for (const [scope, patch] of Object.entries(patches)) {
      patchesByScope.set(scope, patch);
    }
  }
  bumpVersion();
}
//# sourceMappingURL=uiConfig.js.map
