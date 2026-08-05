// wait/shake/cam/pos/type等、「ラベル(short/long等)→実際の値」を引くタグで、
// 微調整のためにラベルの代わりに生の数値を直接書けるようにするための共通ヘルパー。
//
// 例: # wait:long は1200msに解決されるが、# wait:1500 と書けば1500msを直接指定できる。
//
// rawが解釈可能な数値ならその数値を返し、そうでなければラベルテーブルを引く。
export function numericOrLabel(raw, table, fallback) {
    if (raw !== undefined && raw.trim() !== "") {
        const n = Number(raw);
        if (Number.isFinite(n))
            return n;
    }
    return table[raw ?? ""] ?? fallback;
}
// rawが「解釈可能な生の数値」かどうかだけを判定する(値そのものは呼び出し側で
// Number(raw)して使う)。shake/pos/camのように複数の引数をまとめて数値指定
// するケースで、そもそも数値モードかどうかを先に判定したい時に使う。
export function isNumeric(raw) {
    if (raw === undefined || raw.trim() === "")
        return false;
    return Number.isFinite(Number(raw));
}
// タグの真偽値引数は true/false ではなく on/off で統一する(値の種類を
// 「数値・小数・意味のあるラベル」だけに絞る、というタグ設計方針のため。
// true/falseは実装都合の値であって人が読むラベルとしては据わりが悪いので、
// 採用しない)。on/off以外が来た場合はundefinedを返す(呼び出し側で
// 無視するか警告するかを決める)。
export function parseOnOff(raw) {
    if (raw === "on")
        return true;
    if (raw === "off")
        return false;
    return undefined;
}
//# sourceMappingURL=numericOrLabel.js.map