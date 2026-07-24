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
const defaultUiConfig = {
    messageWindow: { interactive: true },
    choice: { spacing: 8, anchor: undefined, offset: 130, interactive: true },
    backlog: { mode: 'perInstance', show: true, anchor: undefined, offset: undefined },
    character: { clickable: true },
    font: {},
};
let config = {
    messageWindow: { ...defaultUiConfig.messageWindow },
    choice: { ...defaultUiConfig.choice },
    backlog: { ...defaultUiConfig.backlog },
    character: { ...defaultUiConfig.character },
    font: { ...defaultUiConfig.font },
};
// 浅いマージ(セクション単位)。VNLayer.configure({ ui: { choice: { spacing: 16 } } })
// のように部分的に渡せばよく、他のセクションの値・同セクション内の他キーも保持される。
export function setUiConfig(partial) {
    config = {
        messageWindow: { ...config.messageWindow, ...partial.messageWindow },
        choice: { ...config.choice, ...partial.choice },
        backlog: { ...config.backlog, ...partial.backlog },
        character: { ...config.character, ...partial.character },
        font: { ...config.font, ...partial.font },
    };
}
export function getUiConfig() {
    return config;
}
//# sourceMappingURL=uiConfig.js.map