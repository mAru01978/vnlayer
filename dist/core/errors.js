// VNLayer全体で使う軽量なエラー型階層。
//
// 目的: 各所でバラバラにconsole.warn(...)していたエラー処理を、種類ごとに
// 区別できるErrorサブクラス + 共通の報告口(reportError)へ寄せる。
// 「例外を投げてストーリー進行を止める」ためのものではなく、あくまで
// 「何が起きたか」を型で表現しつつ、既定の報告手段(console.warn)は維持する
// という位置づけ(挙動自体は大きく変えない、種類分けと拡張性を持たせるのが目的)。
//
// 将来、vn_has_error のような予約変数や、VNLayer.onError(fn) のような
// 横断的な購読APIを追加する際も、ここを起点にできるようにしてある。
export class VNLayerError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = new.target.name;
    }
}
// story.json の取得(fetch)/パースに失敗した場合
export class StoryLoadError extends VNLayerError {
}
// inkjsランタイム自体が投げた/報告したエラー
// (story.onError経由、または ChooseChoiceIndex/ChoosePathString/SwitchFlow等
// のAPI呼び出しが例外を投げた場合)
export class StoryRuntimeError extends VNLayerError {
}
// タグ処理(dispatchTag経由のrun())中の例外、またはタグの引数/書式が不正な場合
export class TagDispatchError extends VNLayerError {
}
// #interrupt(SwitchFlow/ChoosePathString経由の割り込み)処理中の例外
export class InterruptError extends VNLayerError {
}
// 素材(sprite/anim)の解決に失敗した場合。fallbackToMockがfalse(既定)の時、
// 素材が見つからない場合はモック表示にフォールバックせずこのエラーを報告する。
export class AssetError extends VNLayerError {
}
// core/ResourceLoader.ts経由のリソース取得(story.json/素材ファイル)失敗時。
export class ResourceLoadError extends VNLayerError {
}
const listeners = new Set();
const reportedAssetErrors = new Set();
// 開発者側(ホストページ)がエラーを横断的に監視したい場合用の購読口。
// 現状api.ts側からは未公開だが、将来 VNLayer.onError(fn) のような形で
// そのまま繋げられるようにしてある。
export function onVNLayerError(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
// 全エラー経路(story.onError/fetch失敗/タグ実行失敗/interrupt失敗等)を
// 集約するための共通口。既定ではconsole.warnに出す(以前からの挙動を維持)。
export function reportError(error) {
    if (error instanceof AssetError) {
        const key = error.message;
        if (reportedAssetErrors.has(key)) {
            return;
        }
        reportedAssetErrors.add(key);
    }
    if (error.cause !== undefined) {
        console.warn(`[VNLayer] ${error.name}: ${error.message}`, error.cause);
    }
    else {
        console.warn(`[VNLayer] ${error.name}: ${error.message}`);
    }
    listeners.forEach((listener) => listener(error));
}
//# sourceMappingURL=errors.js.map