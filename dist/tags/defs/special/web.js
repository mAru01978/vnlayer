import { registerTag, warnUnknownTag } from "../../registry";
import { getWebLink } from "../../webLinks";
import { isNumeric, parseOnOff } from "../../numericOrLabel";
import * as navigationManager from "../../../core/managers/navigationManager";
import * as webManager from "../../../core/managers/webManager";
import { reportError, TagDispatchError } from "../../../core/errors";
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
//   # web:scroll:hero          → data-vn-id="hero" の要素までスクロール
//   # web:scroll:300:2000      → 2000msかけてゆっくりスクロール(時間指定)
//   # web:emit:hp_changed:50   → ink変数(setContext/getContext)を一切経由
//                                 せず、window.dispatchEventで直接ブラウザ
//                                 側へ通知する(ink→webへの一方通行の唯一の出口)。
//
// 注意: URLを直接 # web:open:https://example.com のように書いても正しく動かない。
// inkのソースファイルは "//" を行コメントの開始として扱うため、コンパイル時点で
// //以降が消えてしまう(この問題を避けるための、上記のリンク名方式)。
//
// 実装はcore/managers/{navigation,web}Managerに委譲。gotoは「バッチの
// 終わりにまとめて遷移する」という進行制御が絡むため、navigationManagerに
// 予約だけしておき、実際のonNavigate呼び出しはcore/useStoryEngine.tsの
// advance()ループが行う。
//
// basic/special分離での位置づけ: action(goto/open/scroll/emit)ごとに書き込み先
// が全く異なる統合タグのため、specialタグとして現状維持。
registerTag({
    key: "web",
    run: ({ args, handlers }) => {
        const { atomKey, instanceId } = handlers;
        const [action, target, durationArg] = args;
        const resolveDestination = (raw) => {
            // "/"始まりは自サイト内のパスとみなし、無条件で許可する。
            if (raw.startsWith("/"))
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
            case "goto": {
                const dest = resolveDestination(target);
                if (dest)
                    navigationManager.requestGoto(atomKey, dest);
                break;
            }
            case "open": {
                const dest = resolveDestination(target);
                if (dest)
                    webManager.openUrl(dest);
                break;
            }
            case "scroll":
                webManager.scrollTo(target, isNumeric(durationArg) ? Number(durationArg) : undefined);
                break;
            case "emit": {
                // args = ['emit', eventName, value]
                const [, eventName, rawValue] = args;
                if (!eventName) {
                    reportError(new TagDispatchError(`web:emit の書式が不正です(# web:emit:<eventName>:<value>): ${args.join(":")}`));
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
                webManager.emitToWeb(instanceId, eventName, value);
                break;
            }
            default:
                warnUnknownTag(["web", action, target].filter(Boolean).join(":"));
        }
    },
});
//# sourceMappingURL=web.js.map