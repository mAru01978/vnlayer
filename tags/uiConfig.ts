// メッセージウィンドウ/選択肢/バックログの見た目・挙動をVNごとに差し替えるための
// 共有ストア。characterSlots.tsと同じ考え方: 実行時にJS(VNLayer.configure)からも
// Ink(#ui:...タグ)からも同じsetUiConfig()経由で上書きできるようにしておき、
// どちらが後に書き込んでも「後勝ち」で反映される(優先度判定ロジックは持たない)。
//
// skin(見た目の素材セット名)自体の実体(実際のCSS/画像)はrealRenderer側が
// 持つ想定。mockRendererはskin名を無視して今まで通りの見た目のままでよい。

export type BacklogMode = 'perInstance' | 'global';

export type UiConfig = {
  messageWindow: { skin?: string };
  // anchor: 指定するとキャラのスロット位置基準で選択肢を表示する(#ui:choice:anchor:alice)。
  // 未指定(既定)なら今まで通りuiAnchor(ステージの角)に固定表示する。
  choice: { skin?: string; spacing?: number; anchor?: string };
  backlog: { skin?: string; mode: BacklogMode };
};

const defaultUiConfig: UiConfig = {
  messageWindow: {},
  choice: { spacing: 8, anchor: undefined },
  backlog: { mode: 'perInstance' },
};

let config: UiConfig = {
  messageWindow: { ...defaultUiConfig.messageWindow },
  choice: { ...defaultUiConfig.choice },
  backlog: { ...defaultUiConfig.backlog },
};

export type UiConfigPatch = {
  messageWindow?: Partial<UiConfig['messageWindow']>;
  choice?: Partial<UiConfig['choice']>;
  backlog?: Partial<UiConfig['backlog']>;
};

// 浅いマージ(セクション単位)。VNLayer.configure({ ui: { choice: { spacing: 16 } } })
// のように部分的に渡せばよく、他のセクションの値・同セクション内の他キーも保持される。
export function setUiConfig(partial: UiConfigPatch): void {
  config = {
    messageWindow: { ...config.messageWindow, ...partial.messageWindow },
    choice: { ...config.choice, ...partial.choice },
    backlog: { ...config.backlog, ...partial.backlog },
  };
}

export function getUiConfig(): UiConfig {
  return config;
}
