// メッセージウィンドウ/選択肢/バックログの見た目・挙動をVNごとに差し替えるための
// 共有ストア。characterSlots.tsと同じ考え方: 実行時にJS(VNLayer.configure)からも
// Ink(#ui:...タグ)からも同じsetUiConfig()経由で上書きできるようにしておき、
// どちらが後に書き込んでも「後勝ち」で反映される(優先度判定ロジックは持たない)。
//
// skin(見た目の素材セット名)自体の実体(実際のCSS/画像)はrealRenderer側が
// 持つ想定。mockRendererはskin名を無視して今まで通りの見た目のままでよい。
const defaultUiConfig = {
    messageWindow: {},
    choice: { spacing: 8, anchor: undefined, offset: 130 },
    backlog: { mode: 'perInstance' },
};
let config = {
    messageWindow: { ...defaultUiConfig.messageWindow },
    choice: { ...defaultUiConfig.choice },
    backlog: { ...defaultUiConfig.backlog },
};
// 浅いマージ(セクション単位)。VNLayer.configure({ ui: { choice: { spacing: 16 } } })
// のように部分的に渡せばよく、他のセクションの値・同セクション内の他キーも保持される。
export function setUiConfig(partial) {
    config = {
        messageWindow: { ...config.messageWindow, ...partial.messageWindow },
        choice: { ...config.choice, ...partial.choice },
        backlog: { ...config.backlog, ...partial.backlog },
    };
}
export function getUiConfig() {
    return config;
}
//# sourceMappingURL=uiConfig.js.map