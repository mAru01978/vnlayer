// #web:scroll のような「実際にDOM要素を探す」系のタグ全般で使う、共通の
// セレクタ解決ヘルパー。
//
// 背景: inkは行の途中に"#"が現れると、そこから新しいタグとして分割して
// しまう(core/instanceRegistry.tsの修正メモ参照)。そのため、ink側のタグ
// 引数に生の"#id"を書くことはできない。かといって、DOM要素を指すのに
// "id"だけ書かせるとinkjs(inkjsそのものの制約ではなく、id/class/カスタム
// 属性のどれで探したいかが曖昧になる)になるため、以下の3通りの書式を
// 用意し、どのタグでも同じ解決ルールになるようにする:
//
//   .foo   → class セレクタ(".foo"のまま、inkの"#"分割問題を受けないので
//            そのまま書ける)
//   @foo   → id セレクタ("#foo"相当。"#"を直接書けない代わりに"@"を使う)
//   foo    → data-vn-id属性で探す([data-vn-id="foo"]相当。id/classを
//            付けたくない/付けられない要素を、任意の名前で参照したい場合向け。
//            例: <div data-vn-id="alice">...</div> を # web:scroll:alice:1000
//            のように参照できる)
export function resolveDomSelectorToken(token) {
  if (token.startsWith("@")) return `#${token.slice(1)}`;
  if (token.startsWith(".")) return token;
  return `[data-vn-id="${token}"]`;
}
//# sourceMappingURL=domSelector.js.map
