// #web:open / #web:goto で「完全に別サイトへ行く」場合に参照する、
// 許可済みリンクのホワイトリスト。
//
// 重要な副産物: inkのソースファイルは "//" を行コメントの開始として扱うため、
// # web:open:https://example.com のようにURLを直接タグに書くと、
// //以降がinkコンパイラの時点でコメットとして消えてしまい、
// 壊れたURL(例: "https:"だけ)になってしまう。
// これを回避するため、ink側には常に「名前(キー)」だけを書かせ、
// 実際のURLはJS側(VNLayer.configure({ webLinks: {...} }))で登録する
// 設計にした。副次効果として、ink側からは登録されていない任意の外部URLへは
// 行けなくなる(ホワイトリスト化)。
const links = new Map();
export function setWebLinks(patch) {
    for (const [key, url] of Object.entries(patch)) {
        links.set(key, url);
    }
}
export function getWebLink(key) {
    return links.get(key);
}
//# sourceMappingURL=webLinks.js.map