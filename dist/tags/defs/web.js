import { registerTag } from '../registry';
import { getWebLink } from '../webLinks';
import { isNumeric } from '../numericOrLabel';
// #web はWeb接続系(ページ遷移/新規タブ/スクロール)をまとめた統合タグ。
// 意図的にこの3つ以上は増やさない方針(VNLayerが持つのは演出レイヤーの
// 最低限のWeb連携だけ、という位置づけ)。
//
//   # web:goto:/next-page      → 同一ページ内(自サイト内)の遷移。パス("/"始まり)
//                                 は無条件で許可(旧#goto相当)。
//   # web:goto:blogHome        → 完全に別サイトへ行く場合は、直接URLを書かず
//                                 「登録済みリンク名」を書く。実URLはJS側の
//                                 VNLayer.configure({ webLinks: { blogHome: "https://..." } })
//                                 で登録したものだけが解決される(ホワイトリスト)。
//                                 未登録の名前は弾かれて何も起きない。
//   # web:open:blogHome        → 新しいタブで開く。goto同様、外部は登録済み
//                                 リンク名のみ。
//   # web:scroll:300           → ページ内をY座標300pxへスクロール
//   # web:scroll:signup-form   → id/セレクタ/アンカー名の要素までスクロール
//   # web:scroll:300:2000      → 2000msかけてゆっくりスクロール(時間指定、
//                                 キャラの歩き移動等と歩調を合わせたい時用)
//
// 注意: URLを直接 # web:open:https://example.com のように書いても正しく動かない。
// inkのソースファイルは "//" を行コメントの開始として扱うため、コンパイル時点で
// //以降が消えてしまう(この問題を避けるための、上記のリンク名方式)。
registerTag({
    key: 'web',
    run: ({ args, handlers }) => {
        const [action, target, durationArg] = args;
        const resolveDestination = (raw) => {
            // "/"始まりは自サイト内のパスとみなし、無条件で許可する。
            if (raw.startsWith('/'))
                return raw;
            // それ以外は「登録済みリンク名」として解決する。未登録なら弾く。
            const resolved = getWebLink(raw);
            if (!resolved) {
                console.warn(`[VNLayer] web:${action}:${raw} は許可済みリンクに登録されていません(ブロックしました)`);
                return null;
            }
            return resolved;
        };
        switch (action) {
            case 'goto': {
                const dest = resolveDestination(target);
                if (dest)
                    handlers.onGoto(dest);
                break;
            }
            case 'open': {
                const dest = resolveDestination(target);
                if (dest)
                    handlers.onOpen(dest);
                break;
            }
            case 'scroll':
                handlers.onScroll(target, isNumeric(durationArg) ? Number(durationArg) : undefined);
                break;
            default:
                handlers.onUnknownTag?.(['web', action, target].filter(Boolean).join(':'));
        }
    },
});
//# sourceMappingURL=web.js.map