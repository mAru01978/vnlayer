import { registerTag, registerAlias } from '../registry';
import { parseOnOff } from '../numericOrLabel';


// #ui はUI制御系(メッセージウィンドウ/選択肢/バックログ/キャラ)をまとめた
// 統合タグ。真偽値は全てon/offで統一する(true/falseは使わない、タグの値は
// 数値・小数・意味のあるラベルのみという設計方針のため)。
// 書式: # ui:<section>:<key>:<value...>
//
//   [messageWindow]
//   # ui:messageWindow:mode:hide        → 個々のメッセージを即座に隠す
//   # ui:messageWindow:mode:transient   → 一定時間で自動的に消える
//   # ui:messageWindow:mode:persist     → 消えずに残る(既定)
//   # ui:messageWindow:fade:in          → 次のメッセージをフェードインで出す
//   # ui:messageWindow:show:on/off      → ウィンドウ自体を箱ごと表示/非表示
//   # ui:messageWindow:interactive:on/off
//                                       → クリックでの文字送りスキップの有効/無効
//   # ui:messageWindow:skin:izakaya     → 見た目の素材セットを差し替え(本番用)
//
//   [choice]
//   # ui:choice:show:on/off             → 選択肢を箱ごと表示/非表示
//   # ui:choice:interactive:on/off      → ボタンのクリックを一時的に無効化
//   # ui:choice:spacing:16              → 選択肢ボタン間の余白(px)
//   # ui:choice:skin:fancy              → ボタンの見た目セット(本番用)
//   # ui:choice:anchor:alice            → キャラのスロット位置基準で表示
//   # ui:choice:anchor:reset            → 位置基準を解除し、既定のuiAnchor(角)に戻す
//   # ui:choice:offset:200              → 余白(px)。anchor未指定なら「画面端からの
//                                          距離」、anchor指定時は「キャラ位置からの
//                                          距離」(どちらもはみ出さないよう自動で
//                                          スクロール枠になる)
//
//   [backlog]
//   # ui:backlog:clear                  → 会話ログをクリア
//   # ui:backlog:show:on/off            → 開閉ボタン自体の表示/非表示
//   # ui:backlog:skin:izakaya           → 見た目の素材セット(本番用)
//   # ui:backlog:mode:global            → 全VN共通の統合バックログにする
//   # ui:backlog:mode:perInstance       → 個別バックログに戻す(既定)
//   # ui:backlog:anchor:alice           → choiceと同様、キャラ位置基準で表示
//   # ui:backlog:offset:200             → choiceと同様の余白(px)
//
//   [character]
//   # ui:character:clickable:on/off     → キャラクリック(char_click notify)の
//                                          有効/無効を一時的に切り替える
//
//   [font]
//   # ui:font:family:"Noto Sans JP"     → VNLayer全体で使うフォント
//   # ui:font:size:16                   → 基準フォントサイズ(px)
export type UiTagConfig = { transientDurationMs: number };

const defaultConfig: UiTagConfig = {
  transientDurationMs: 4000,
};

registerTag<UiTagConfig>({
  key: 'ui',
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const [section, key, ...rest] = args;
    const value = rest.join(':');

    if (section === 'messageWindow') {
      if (key === 'mode') {
        if (value === 'hide') return handlers.setMessageMode('hide');
        if (value === 'transient') return handlers.setMessageMode('transient', config.transientDurationMs);
        return handlers.setMessageMode('persist');
      }
      if (key === 'fade') return handlers.setNextRevealFade(value === 'in');
      if (key === 'show') {
        const on = parseOnOff(value);
        if (on !== undefined) handlers.setMessageWindowVisible(on);
        return;
      }
      if (key === 'interactive') {
        const on = parseOnOff(value);
        if (on !== undefined) handlers.setUiConfig({ messageWindow: { interactive: on } });
        return;
      }
      if (key === 'skin') return handlers.setUiConfig({ messageWindow: { skin: value } });
      return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
    }

    if (section === 'choice') {
      if (key === 'show') {
        const on = parseOnOff(value);
        if (on !== undefined) handlers.setChoicesVisible(on);
        return;
      }
      if (key === 'interactive') {
        const on = parseOnOff(value);
        if (on !== undefined) handlers.setUiConfig({ choice: { interactive: on } });
        return;
      }
      if (key === 'spacing') {
        const n = Number(value);
        if (Number.isFinite(n)) return handlers.setUiConfig({ choice: { spacing: n } });
        return;
      }
      if (key === 'skin') return handlers.setUiConfig({ choice: { skin: value } });
      if (key === 'anchor') return handlers.setUiConfig({ choice: { anchor: value === 'reset' ? undefined : value } });
      if (key === 'offset') {
        const n = Number(value);
        if (Number.isFinite(n)) return handlers.setUiConfig({ choice: { offset: n } });
        return;
      }
      return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
    }

    if (section === 'backlog') {
      if (key === 'clear') return handlers.clearLines();
      if (key === 'show') {
        const on = parseOnOff(value);
        if (on !== undefined) handlers.setUiConfig({ backlog: { show: on } });
        return;
      }
      if (key === 'skin') return handlers.setUiConfig({ backlog: { skin: value } });
      if (key === 'mode' && (value === 'global' || value === 'perInstance')) {
        return handlers.setUiConfig({ backlog: { mode: value } });
      }
      if (key === 'anchor') return handlers.setUiConfig({ backlog: { anchor: value === 'reset' ? undefined : value } });
      if (key === 'offset') {
        const n = Number(value);
        if (Number.isFinite(n)) return handlers.setUiConfig({ backlog: { offset: n } });
        return;
      }
      return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
    }

    if (section === 'character') {
      if (key === 'clickable') {
        const on = parseOnOff(value);
        if (on !== undefined) handlers.setUiConfig({ character: { clickable: on } });
        return;
      }
      return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
    }

    if (section === 'font') {
      if (key === 'family') return handlers.setUiConfig({ font: { family: value } });
      if (key === 'size') {
        const n = Number(value);
        if (Number.isFinite(n)) return handlers.setUiConfig({ font: { sizePx: n } });
        return;
      }
      return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
    }

    handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
  },
});

registerAlias('u', 'ui');
