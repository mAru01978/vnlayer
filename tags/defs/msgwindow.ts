import { registerTag } from '../registry';

// # msgwindow:hide / # msgwindow:show
// choices:hide/showと同じ考え方で、メッセージウィンドウ(吹き出し・ナレーション
// キャプション)自体をこのシーンでは出さない、という「箱ごと消す」タグ。
// msg:hide/transient/persist は個々のメッセージの残り方の制御なので、役割が異なる。
registerTag({
  key: 'msgwindow',
  run: ({ args, handlers }) => handlers.setMessageWindowVisible(args[0] !== 'hide'),
});
