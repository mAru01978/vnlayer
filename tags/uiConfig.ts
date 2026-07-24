// メッセージウィンドウ/選択肢/バックログ/キャラの見た目・挙動をVNごとに
// 差し替えるための共有ストア。characterSlots.tsと同じ考え方: 実行時に
// JS(VNLayer.configure)からもInk(#ui:...タグ)からも同じsetUiConfig()経由で
// 上書きできるようにしておき、どちらが後に書き込んでも「後勝ち」で反映される
// (優先度判定ロジックは持たない)。
//
// skin(見た目の素材セット名)自体の実体(実際のCSS/画像)はrealRenderer側が
// 持つ想定。mockRendererはskin名を無視して今まで通りの見た目のままでよい。
//
// 真偽値は全てon/off(boolean)で統一している。true/falseという値そのものは
// タグの引数としては使わない(タグ設計方針: 数値・小数・意味のあるラベルのみ)。

export type BacklogMode = 'perInstance' | 'global';

export type UiConfig = {
  messageWindow: {
    skin?: string;
    // interactive:off にすると、メッセージ欄クリックでの文字送りスキップを
    // 無効化できる(例: 演出が終わって選択肢に戻った後、古いクリックの
    // 余韻で誤反応してほしくない場面などに使う)。既定はon。
    interactive: boolean;
  };
  // anchor: 指定するとキャラのスロット位置基準で選択肢を表示する(#ui:choice:anchor:alice)。
  // 未指定(既定)なら今まで通りuiAnchor(ステージの角)に固定表示する。
  // offset: 角固定表示時は「角からの距離(px)」、anchor指定時は「キャラ位置からの距離(px)」。
  // interactive:off で選択肢ボタンのクリックそのものを一時的に無効化できる。
  choice: { skin?: string; spacing?: number; anchor?: string; offset?: number; interactive: boolean };
  // show: バックログ"開閉ボタン"自体の表示/非表示(実行時にInk側からも切り替え可能。
  // mount時のshowUi.backlogButtonは初期値、こちらは実行中の上書き)。
  // anchor/offset: choiceと同じ考え方でボタン位置を調整できる。
  backlog: { skin?: string; mode: BacklogMode; show: boolean; anchor?: string; offset?: number };
  // キャラクリック(char_click notify)自体を一時的に無効化したい場合に使う。
  // 例: 反応後の一定期間、同じキャラを連打されても再反応させたくない時。
  character: { clickable: boolean };
  // VNLayer全体で使うフォント。本番の素材/フォントに差し替える際に使う。
  font: { family?: string; sizePx?: number };
};

const defaultUiConfig: UiConfig = {
  messageWindow: { interactive: true },
  choice: { spacing: 8, anchor: undefined, offset: 130, interactive: true },
  backlog: { mode: 'perInstance', show: true, anchor: undefined, offset: undefined },
  character: { clickable: true },
  font: {},
};

let config: UiConfig = {
  messageWindow: { ...defaultUiConfig.messageWindow },
  choice: { ...defaultUiConfig.choice },
  backlog: { ...defaultUiConfig.backlog },
  character: { ...defaultUiConfig.character },
  font: { ...defaultUiConfig.font },
};

export type UiConfigPatch = {
  messageWindow?: Partial<UiConfig['messageWindow']>;
  choice?: Partial<UiConfig['choice']>;
  backlog?: Partial<UiConfig['backlog']>;
  character?: Partial<UiConfig['character']>;
  font?: Partial<UiConfig['font']>;
};

// 浅いマージ(セクション単位)。VNLayer.configure({ ui: { choice: { spacing: 16 } } })
// のように部分的に渡せばよく、他のセクションの値・同セクション内の他キーも保持される。
export function setUiConfig(partial: UiConfigPatch): void {
  config = {
    messageWindow: { ...config.messageWindow, ...partial.messageWindow },
    choice: { ...config.choice, ...partial.choice },
    backlog: { ...config.backlog, ...partial.backlog },
    character: { ...config.character, ...partial.character },
    font: { ...config.font, ...partial.font },
  };
}

export function getUiConfig(): UiConfig {
  return config;
}
