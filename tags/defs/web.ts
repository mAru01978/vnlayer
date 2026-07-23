import { registerTag } from '../registry';

// #web はWeb接続系(ページ遷移/新規タブ/スクロール)をまとめた統合タグ。
// 意図的にこの3つ以上は増やさない方針(VNLayerが持つのは演出レイヤーの
// 最低限のWeb連携だけ、という位置づけ)。
//
//   # web:goto:/next-page      → 同一タブ内で遷移(旧#goto)
//   # web:open:https://...     → 新しいタブで開く
//   # web:scroll:300           → ページ内をY座標300pxへスクロール
//   # web:scroll:signup-form   → id/セレクタ/アンカー名の要素までスクロール
registerTag({
  key: 'web',
  run: ({ args, handlers }) => {
    const [action, ...rest] = args;
    const value = rest.join(':');

    switch (action) {
      case 'goto':
        handlers.onGoto(value);
        break;
      case 'open':
        handlers.onOpen(value);
        break;
      case 'scroll':
        handlers.onScroll(value);
        break;
      default:
        handlers.onUnknownTag?.(['web', action, ...rest].filter(Boolean).join(':'));
    }
  },
});
