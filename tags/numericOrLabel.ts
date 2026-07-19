// wait/shake/cam/pos/type等、「ラベル(short/long等)→実際の値」を引くタグで、
// 微調整のためにラベルの代わりに生の数値を直接書けるようにするための共通ヘルパー。
//
// 例: # wait:long は1200msに解決されるが、# wait:1500 と書けば1500msを直接指定できる。
//
// rawが解釈可能な数値ならその数値を返し、そうでなければラベルテーブルを引く。
export function numericOrLabel(
  raw: string | undefined,
  table: Record<string, number>,
  fallback: number
): number {
  if (raw !== undefined && raw.trim() !== '') {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return table[raw ?? ''] ?? fallback;
}

// rawが「解釈可能な生の数値」かどうかだけを判定する(値そのものは呼び出し側で
// Number(raw)して使う)。shake/pos/camのように複数の引数をまとめて数値指定
// するケースで、そもそも数値モードかどうかを先に判定したい時に使う。
export function isNumeric(raw: string | undefined): boolean {
  if (raw === undefined || raw.trim() === '') return false;
  return Number.isFinite(Number(raw));
}
