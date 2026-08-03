import { registerTag } from "../registry";
// # msg_window:hide / # msg_window:show
// choices:hide/showと同じ考え方で、メッセージウィンドウ(吹き出し・ナレーション
// キャプション)自体をこのシーンでは出さない、という「箱ごと消す」タグ。
// msg:hide/transient/persist は個々のメッセージの残り方の制御なので、役割が異なる。
registerTag({
  key: "msg_window",
  run: ({ args, handlers }) =>
    handlers.setMessageWindowVisible(args[0] !== "hide"),
});
//# sourceMappingURL=msg_window.js.map
