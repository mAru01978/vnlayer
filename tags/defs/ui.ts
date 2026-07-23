import { registerTag, registerAlias } from '../registry';
import { setUiConfig } from '../uiConfig';

// #ui はUI制御系(メッセージウィンドウ/選択肢/バックログ)をまとめた統合タグ。
// 以前分かれていた #msg, #msg_fade, #msg_window, #choices, #clear を吸収し、
// それに加えて本番差し替え用のskin/spacing/mode指定もここに乗せる。
// 書式: # ui:<section>:<key>:<value...>
//
//   [messageWindow]
//   # ui:messageWindow:mode:hide        → 個々のメッセージを即座に隠す(旧#msg:hide)
//   # ui:messageWindow:mode:transient   → 一定時間で自動的に消える(旧#msg:transient)
//   # ui:messageWindow:mode:persist     → 消えずに残る(旧#msg、既定)
//   # ui:messageWindow:fade:in          → 次のメッセージをフェードインで出す(旧#msg_fade:in)
//   # ui:messageWindow:visible:false    → ウィンドウ自体を箱ごと隠す(旧#msg_window:hide)
//   # ui:messageWindow:visible:true     → ウィンドウを再び出す(旧#msg_window:show)
//   # ui:messageWindow:skin:izakaya     → 見た目の素材セットを差し替え(新規、本番用)
//
//   [choice]
//   # ui:choice:visible:false           → 選択肢を箱ごと隠す(旧#choices:hide)
//   # ui:choice:visible:true            → 選択肢を再び出す(旧#choices:show)
//   # ui:choice:spacing:16              → 選択肢ボタン間の余白(px、新規)
//   # ui:choice:skin:fancy              → ボタンの見た目セット(新規、本番用)
//   # ui:choice:anchor:alice            → 選択肢をaliceのスロット位置基準で表示(新規)
//   # ui:choice:anchor:reset            → 位置基準を解除し、既定のuiAnchor(角)に戻す
//
//   [backlog]
//   # ui:backlog:clear                  → 会話ログをクリア(旧#clear)
//   # ui:backlog:skin:izakaya           → 見た目の素材セット(新規、本番用)
//   # ui:backlog:mode:global            → 全VN共通の統合バックログにする(新規)
//   # ui:backlog:mode:perInstance       → 個別バックログに戻す(既定)
export type UiTagConfig = { transientDurationMs: number };

const defaultConfig: UiTagConfig = {
  transientDurationMs: 4000,
};

registerTag<UiTagConfig>({
  key: 'ui',
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const [section, key, value] = args;

    if (section === 'messageWindow') {
      if (key === 'mode') {
        if (value === 'hide') return handlers.setMessageMode('hide');
        if (value === 'transient') return handlers.setMessageMode('transient', config.transientDurationMs);
        return handlers.setMessageMode('persist');
      }
      if (key === 'fade') return handlers.setNextRevealFade(value === 'in');
      if (key === 'visible') return handlers.setMessageWindowVisible(value !== 'false');
      if (key === 'skin') return setUiConfig({ messageWindow: { skin: value } });
      return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
    }

    if (section === 'choice') {
      if (key === 'visible') return handlers.setChoicesVisible(value !== 'false');
      if (key === 'spacing') {
        const n = Number(value);
        if (Number.isFinite(n)) return setUiConfig({ choice: { spacing: n } });
        return;
      }
      if (key === 'skin') return setUiConfig({ choice: { skin: value } });
      if (key === 'anchor') return setUiConfig({ choice: { anchor: value === 'reset' ? undefined : value } });
      return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
    }

    if (section === 'backlog') {
      if (key === 'clear') return handlers.clearLines();
      if (key === 'skin') return setUiConfig({ backlog: { skin: value } });
      if (key === 'mode' && (value === 'global' || value === 'perInstance')) {
        return setUiConfig({ backlog: { mode: value } });
      }
      return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
    }

    handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
  },
});

registerAlias('u', 'ui');
