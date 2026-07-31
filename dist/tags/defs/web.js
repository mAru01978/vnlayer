import { registerTag } from '../registry';
import { getWebLink } from '../webLinks';
import { isNumeric, parseOnOff } from '../numericOrLabel';
// #web はWeb接続系(ページ遷移/新規タブ/スクロール/VN間イベント連携)をまとめた統合タグ。
// 以前は「意図的にこの3つ以上は増やさない方針」としていたが、それは絶対的な
// ルールではなくあくまで方針だったため、VN間イベント連携(emit)もここに含める
// ことにした。
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
//   # web:scroll:.section1     → class="section1" の要素までスクロール
//   # web:scroll:@signup-form  → id="signup-form" の要素までスクロール
//                                 ("#"は直接書けない代わりに"@"を使う。
//                                 tags/domSelector.ts参照)
//   # web:scroll:hero          → data-vn-id="hero" の要素までスクロール
//                                 (id/classを付けたくない要素を、任意の
//                                 名前で参照したい場合向け)
//   # web:scroll:300:2000      → 2000msかけてゆっくりスクロール(時間指定、
//                                 キャラの歩き移動等と歩調を合わせたい時用)
//   # web:emit:hp_changed:50   → ink変数(setContext/getContext)を一切経由
//                                 せず、window.dispatchEventで直接ブラウザ
//                                 側へ通知する(ink→webへの一方通行の
//                                 唯一の出口)。host側は例えば
//                                 window.addEventListener("vnlayer:emit",
//                                 (e) => { e.detail.name, e.detail.payload,
//                                 e.detail.instanceId }) のように受け取る。
//                                 値はisNumeric()なら数値、on/offなら
//                                 booleanとして解釈し、それ以外は文字列の
//                                 まま渡す(他のタグと同じ変換ルール)。
//                                 VN間通信をしたい場合は別の#emit(selector
//                                 指定)タグを使う(こちらとは無関係)。
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
            case 'emit': {
                // args = ['emit', eventName, value]
                // ink変数(setContext/getContext)は一切経由せず、直接ブラウザへ
                // イベントを飛ばす(ink→webへの一方通行の唯一の出口)。
                // #emit(VN間通信、selector指定)とは無関係の別の仕組み。
                const [, eventName, rawValue] = args;
                if (!eventName) {
                    console.warn(`[VNLayer] web:emit の書式が不正です(# web:emit:<eventName>:<value>): ${args.join(':')}`);
                    break;
                }
                let value = rawValue;
                if (isNumeric(rawValue)) {
                    value = Number(rawValue);
                }
                else {
                    const on = parseOnOff(rawValue);
                    if (on !== undefined)
                        value = on;
                }
                handlers.emitToWeb(eventName, value);
                break;
            }
            default:
                handlers.onUnknownTag?.(['web', action, target].filter(Boolean).join(':'));
        }
    },
});
//# sourceMappingURL=web.js.map