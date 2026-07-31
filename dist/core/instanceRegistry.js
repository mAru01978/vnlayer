// #emit(VN間イベント連携)用の、mount中インスタンス間の橋渡し。
//
// api.ts側にも「mount中インスタンスのMap」(instances)があるが、あちらは
// React/DOMのcreateRoot等に依存する「mount()の実装詳細」であり、core/配下
// (fetch/DOM非依存の層)から直接importするのは筋が悪い。
// ここでは「selector文字列 → setContextVarsだけを持つ薄いターゲット」という
// 最小限の形でcore/内に閉じたレジストリを用意し、各VNインスタンス自身
// (core/useStoryEngine.ts)が自分のinstanceId(=mount時のselector)で
// 自己登録/解除する形にした。api.ts側の変更は不要。
//
// #emit:<selector>:<varName>:<value> タグ(tags/defs/emit.ts)が、この
// レジストリ経由で「他のVNインスタンス」のsetContextVarsを呼び出す
// (expose:false, notify:trueで、そのインスタンスのink変数へ一方通行で書き込む)。
//
// 注意: #web:emit(ink→ブラウザへの通知)はこれとは無関係。あちらはink変数/
// VNインスタンスを一切経由せず、window.dispatchEvent(CustomEvent)で直接
// ページ側(host JSのaddEventListener)へ飛ばす別の仕組み。
// 修正メモ: inkは行の途中に"#"が現れると、そこから新しいタグとして
// 分割してしまう(例: "# emit:#vn2:..." は ink側で "emit:" と
// "#vn2:..." という2つの別々のタグに分かれてしまう)。これは
// tags/webLinks.tsで対応した「"//"がinkの行コメント開始として解釈され
// URLが壊れる」問題と同種のもの。
// これを避けるため、selectorは"#"/"."/"@"のいずれの記号付きで書いても
// 剥がして比較する(#emitはDOM要素ではなくJS側のこのMapのキー照合なので、
// tags/domSelector.tsのdata-vn-id属性解決は関係ない。"@"は"#"の代わりに
// 使える表記として単に同じ意味で扱う)。
// ink側では # emit:vn2:varName:value / # emit:@vn2:varName:value の
// どちらでも書ける(mount("#vn2", ...)のような実際のCSSセレクタ側は
// 今まで通り"#"付きのまま)。
function normalizeSelector(selector) {
    return selector.replace(/^[#.@]/, '');
}
const registry = new Map();
export function registerInstance(selector, target) {
    registry.set(normalizeSelector(selector), target);
}
export function unregisterInstance(selector) {
    registry.delete(normalizeSelector(selector));
}
export async function emitToInstance(selector, vars, options) {
    const target = registry.get(normalizeSelector(selector));
    if (!target) {
        console.warn(`[VNLayer] emit: no mounted instance found for selector "${selector}" (is it mounted yet?)`);
        return;
    }
    await target.setContextVars(vars, options);
}
//# sourceMappingURL=instanceRegistry.js.map