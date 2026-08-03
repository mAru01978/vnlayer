import { registerTag, registerAlias, warnUnknownTag } from "../../registry";
import { parseOnOff } from "../../numericOrLabel";
import { setUiConfig as setUiConfigStore } from "../../uiConfig";
import * as messageManager from "../../../core/managers/messageManager";
import * as windowVisibilityManager from "../../../core/managers/windowVisibilityManager";
import * as choiceManager from "../../../core/managers/choiceManager";
import * as backlogManager from "../../../core/managers/backlogManager";

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
//   # ui:messageWindow:offset:130       → キャラの立ち位置(originY%)から吹き出し
//                                          下端までの距離(px、既定130)。
//   # ui:messageWindow:autoHideOnCharHide:on/off
//                                       → 話者が#s:name:hideで非表示になった時、
//                                          自動でその吹き出しをフェードアウト
//                                          させるか(既定on)。
//   # ui:messageWindow:autoHideOnBgChange:on/off
//                                       → #bgで背景が実際に変わった(場面転換)時、
//                                          居残っていた吹き出しを自動で
//                                          フェードアウトさせるか(既定on)。
//
//   [choice]
//   # ui:choice:show:on/off             → 選択肢を箱ごと表示/非表示
//   # ui:choice:interactive:on/off      → ボタンのクリックを一時的に無効化
//   # ui:choice:spacing:16              → 選択肢ボタン間の余白(px)
//   # ui:choice:skin:fancy              → ボタンの見た目セット(本番用)
//   # ui:choice:anchor:alice            → キャラのスロット位置基準で表示
//   # ui:choice:anchor:reset            → 位置基準を解除し、既定のuiAnchor(角)に戻す
//   # ui:choice:offset:200              → 余白(px)。
//   # ui:choice:autoClearOnChoose:on/off
//                                       → choose()した瞬間、次の選択肢が決まる
//                                          までの間、古い選択肢ボタンを即座に
//                                          非表示にするか(既定on)。
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
//
//   [stage]
//   # ui:stage:stickToViewport:on/off   → overlayモード時、キャラ/背景/UIが
//                                          ページスクロールに追従するか(既定on)
//   # ui:stage:height:2000              → stickToViewport:off時のこの箱自体の高さ(px)
//   # ui:stage:width:1080               → この箱自体の幅(px、中央寄せ)
//
// 実装は、messageWindow/choice/backlogの「動作」系(mode/fade/show/clear)は
// 各専用マネージャー(messageManager/windowVisibilityManager/choiceManager/
// backlogManager)にatomKey(状態隔離キー)を渡して委譲し、それ以外の
// 「見た目設定」系(interactive/skin/offset/spacing/anchor/font/stage等)は
// tags/uiConfig.tsのsetUiConfig()にinstanceId(公開スコープ識別子、未指定
// =グローバル)を渡して直接委譲する。backlogManager.clear()だけは両方
// 必要(自分のlinesを消すのにatomKey、全VN共通バックログかどうかの判定に
// instanceId)。
//
// basic/special分離での位置づけ: section×keyの組み合わせで書き込み先が
// 大きく分岐する巨大な統合タグのため、specialタグとして現状維持
// (core/useStoryEngine.tsは一切経由しない)。
export type UiTagConfig = { transientDurationMs: number };

const defaultConfig: UiTagConfig = {
  transientDurationMs: 4000,
};

registerTag<UiTagConfig>({
  key: "ui",
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const { atomKey, instanceId } = handlers;
    const [section, key, ...rest] = args;
    const value = rest.join(":");

    if (section === "messageWindow") {
      if (key === "mode") {
        if (value === "hide") return messageManager.setMode(atomKey, "hide");
        if (value === "transient")
          return messageManager.setMode(
            atomKey,
            "transient",
            config.transientDurationMs,
          );
        return messageManager.setMode(atomKey, "persist");
      }
      if (key === "fade")
        return messageManager.setNextRevealFade(atomKey, value === "in");
      if (key === "show") {
        const on = parseOnOff(value);
        if (on !== undefined)
          windowVisibilityManager.setMessageWindowVisible(atomKey, on);
        return;
      }
      if (key === "interactive") {
        const on = parseOnOff(value);
        if (on !== undefined)
          setUiConfigStore({ messageWindow: { interactive: on } }, instanceId);
        return;
      }
      if (key === "skin")
        return setUiConfigStore({ messageWindow: { skin: value } }, instanceId);
      if (key === "offset") {
        const n = Number(value);
        if (Number.isFinite(n))
          return setUiConfigStore({ messageWindow: { offset: n } }, instanceId);
        return;
      }
      if (key === "autoHideOnCharHide") {
        const on = parseOnOff(value);
        if (on !== undefined)
          setUiConfigStore(
            { messageWindow: { autoHideOnCharHide: on } },
            instanceId,
          );
        return;
      }
      if (key === "autoHideOnBgChange") {
        const on = parseOnOff(value);
        if (on !== undefined)
          setUiConfigStore(
            { messageWindow: { autoHideOnBgChange: on } },
            instanceId,
          );
        return;
      }
      return warnUnknownTag(
        ["ui", section, key, value].filter(Boolean).join(":"),
      );
    }

    if (section === "choice") {
      if (key === "show") {
        const on = parseOnOff(value);
        if (on !== undefined) choiceManager.setChoicesVisible(atomKey, on);
        return;
      }
      if (key === "autoClearOnChoose") {
        const on = parseOnOff(value);
        if (on !== undefined)
          setUiConfigStore({ choice: { autoClearOnChoose: on } }, instanceId);
        return;
      }
      if (key === "interactive") {
        const on = parseOnOff(value);
        if (on !== undefined)
          setUiConfigStore({ choice: { interactive: on } }, instanceId);
        return;
      }
      if (key === "spacing") {
        const n = Number(value);
        if (Number.isFinite(n))
          return setUiConfigStore({ choice: { spacing: n } }, instanceId);
        return;
      }
      if (key === "skin")
        return setUiConfigStore({ choice: { skin: value } }, instanceId);
      if (key === "anchor")
        return setUiConfigStore(
          { choice: { anchor: value === "reset" ? undefined : value } },
          instanceId,
        );
      if (key === "offset") {
        const n = Number(value);
        if (Number.isFinite(n))
          return setUiConfigStore({ choice: { offset: n } }, instanceId);
        return;
      }
      return warnUnknownTag(
        ["ui", section, key, value].filter(Boolean).join(":"),
      );
    }

    if (section === "backlog") {
      if (key === "clear") return backlogManager.clear(atomKey, instanceId);
      if (key === "show") {
        const on = parseOnOff(value);
        if (on !== undefined)
          setUiConfigStore({ backlog: { show: on } }, instanceId);
        return;
      }
      if (key === "skin")
        return setUiConfigStore({ backlog: { skin: value } }, instanceId);
      if (key === "mode" && (value === "global" || value === "perInstance")) {
        return setUiConfigStore({ backlog: { mode: value } }, instanceId);
      }
      if (key === "anchor")
        return setUiConfigStore(
          { backlog: { anchor: value === "reset" ? undefined : value } },
          instanceId,
        );
      if (key === "offset") {
        const n = Number(value);
        if (Number.isFinite(n))
          return setUiConfigStore({ backlog: { offset: n } }, instanceId);
        return;
      }
      return warnUnknownTag(
        ["ui", section, key, value].filter(Boolean).join(":"),
      );
    }

    if (section === "character") {
      if (key === "clickable") {
        const on = parseOnOff(value);
        if (on !== undefined)
          setUiConfigStore({ character: { clickable: on } }, instanceId);
        return;
      }
      return warnUnknownTag(
        ["ui", section, key, value].filter(Boolean).join(":"),
      );
    }

    if (section === "font") {
      if (key === "family")
        return setUiConfigStore({ font: { family: value } }, instanceId);
      if (key === "size") {
        const n = Number(value);
        if (Number.isFinite(n))
          return setUiConfigStore({ font: { sizePx: n } }, instanceId);
        return;
      }
      return warnUnknownTag(
        ["ui", section, key, value].filter(Boolean).join(":"),
      );
    }

    if (section === "stage") {
      if (key === "stickToViewport") {
        const on = parseOnOff(value);
        if (on !== undefined)
          setUiConfigStore({ stage: { stickToViewport: on } }, instanceId);
        return;
      }
      if (key === "height") {
        const n = Number(value);
        if (Number.isFinite(n) && n > 0)
          return setUiConfigStore({ stage: { heightPx: n } }, instanceId);
        return;
      }
      if (key === "width") {
        const n = Number(value);
        if (Number.isFinite(n) && n > 0)
          return setUiConfigStore({ stage: { widthPx: n } }, instanceId);
        return;
      }
      return warnUnknownTag(
        ["ui", section, key, value].filter(Boolean).join(":"),
      );
    }

    warnUnknownTag(["ui", section, key, value].filter(Boolean).join(":"));
  },
});

registerAlias("u", "ui");
