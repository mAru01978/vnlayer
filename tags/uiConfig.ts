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

export type BacklogMode = 'perInstance' | 'global';

export type UiConfig = {
  messageWindow: { skin?: string; interactive: boolean };
  choice: { skin?: string; spacing?: number; anchor?: string; offset?: number; interactive: boolean };
  backlog: { skin?: string; mode: BacklogMode; show: boolean; anchor?: string; offset?: number };
  character: { clickable: boolean };
  font: { family?: string; sizePx?: number };
  // stickToViewport:on(既定) → overlayモード時、キャラ/背景/UIがビューポートに
  // 貼り付いたまま、ページをスクロールしても付いてくる(今までの挙動)。
  // off にすると、ページの通常のコンテンツと同じように、スクロールで
  // 画面外へ流れていくようになる(ブログページに埋め込んで、スクロールで
  // キャラが後ろへ流れていくような使い方向け)。
  stage: { stickToViewport: boolean };
};

export type UiConfigPatch = {
  messageWindow?: Partial<UiConfig['messageWindow']>;
  choice?: Partial<UiConfig['choice']>;
  backlog?: Partial<UiConfig['backlog']>;
  character?: Partial<UiConfig['character']>;
  font?: Partial<UiConfig['font']>;
  stage?: Partial<UiConfig['stage']>;
};

const defaultUiConfig: UiConfig = {
  messageWindow: { interactive: true },
  choice: { spacing: 8, anchor: undefined, offset: 130, interactive: true },
  backlog: { mode: 'perInstance', show: true, anchor: undefined, offset: undefined },
  character: { clickable: true },
  font: {},
  stage: { stickToViewport: true },
};

const GLOBAL_SCOPE = '__global__';

// スコープ(グローバルは特別なキー、インスタンス別は選択肢文字列そのまま)ごとに
// 「差分(patch)」だけを保持する。フルの設定値ではなく差分で持つことで、
// 「そのスコープで明示的に設定した項目だけ」がグローバルの上に重なるようにする。
const patchesByScope = new Map<string, UiConfigPatch>();

function mergeSection<T extends object>(base: T, patch: Partial<T> | undefined): T {
  return patch ? { ...base, ...patch } : base;
}

function mergePatch(base: UiConfig, patch: UiConfigPatch | undefined): UiConfig {
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

function computeGlobal(): UiConfig {
  return mergePatch(defaultUiConfig, patchesByScope.get(GLOBAL_SCOPE));
}

// scopeを省略(またはundefined)するとグローバル設定を更新する
// (=すべてのVNインスタンスに影響する既定値)。
// scopeにセレクタ文字列("#vn"等)を渡すと、そのインスタンスだけの
// 上書き設定として記録される(グローバル設定はそのまま、他のVNには影響しない)。
export function setUiConfig(patch: UiConfigPatch, scope?: string): void {
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
}

// scopeを省略するとグローバル設定(全VN共通の既定値)を返す。
// scopeを指定すると、グローバル設定の上にそのインスタンス専用の上書きを
// 重ねた「実効設定」を返す(そのインスタンス専用の上書きが無い項目は
// グローバルの値がそのまま使われる)。
export function getUiConfig(scope?: string): UiConfig {
  const global = computeGlobal();
  if (!scope) return global;
  return mergePatch(global, patchesByScope.get(scope));
}
