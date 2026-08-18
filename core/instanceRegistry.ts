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
//
// 追記(#emit自己通知拡張): # emit:<varName>:<value>(selectorを省略した
// 2引数形)は「同一Ink(自分自身)への通知」として扱う。#interruptを同じink
// ファイル内から起点にしたい場合、素のink代入(~ pending_x = 1)でも
// story.ObserveVariableは発火する(inkjs的にはそれで十分)が、#emitの
// 2引数形を使うと VNLayer.setContext(..., {notify:true}) と同じ経路
// (_seq自動採番/#wait・type_wait待ちの即時打ち切り/event_loopの#interrupt
// 付き選択肢への自動遷移マーク)にも一緒に乗る。他VNへの送信(selector必須)
// とは別のMap(selfRegistry、atomKeyキー)で持つ — instanceId(公開スコープ
// 識別子、mount()時に省略されうる)とは値空間が別物なので、混ざらないように
// 完全に分離してある。
import { reportError, TagDispatchError } from "./errors";

function normalizeSelector(selector: string): string {
  return selector.replace(/^[#.@]/, "");
}

export type EmitTarget = {
  setContextVars: (
    vars: Record<string, unknown>,
    options?: { notify?: boolean; expose?: boolean },
  ) => Promise<void>;
};

const registry = new Map<string, EmitTarget>();
// atomKey単位の自己登録用(instanceId未指定のインスタンスでも必ず動く)。
const selfRegistry = new Map<string, EmitTarget>();

export function registerInstance(selector: string, target: EmitTarget): void {
  registry.set(normalizeSelector(selector), target);
}

export function unregisterInstance(selector: string): void {
  registry.delete(normalizeSelector(selector));
}

export async function emitToInstance(
  selector: string,
  vars: Record<string, unknown>,
  options?: { notify?: boolean; expose?: boolean },
): Promise<void> {
  const target = registry.get(normalizeSelector(selector));
  if (!target) {
    throw new TagDispatchError(
      `emit: no mounted instance found for selector "${selector}" (is it mounted yet?)`,
    );
    return;
  }
  await target.setContextVars(vars, options);
}

// core/useStoryEngine.ts側が、instanceIdの有無に関わらず必ず自分の
// atomKeyで自己登録する(# emit:<varName>:<value> の2引数=自己通知形用)。
export function registerSelf(atomKey: string, target: EmitTarget): void {
  selfRegistry.set(atomKey, target);
}

export function unregisterSelf(atomKey: string): void {
  selfRegistry.delete(atomKey);
}

export async function emitToSelf(
  atomKey: string,
  vars: Record<string, unknown>,
  options?: { notify?: boolean; expose?: boolean },
): Promise<void> {
  const target = selfRegistry.get(atomKey);
  if (!target) {
    throw new TagDispatchError(
      `emit: instance not ready yet (atomKey "${atomKey}")`,
    );
    return;
  }
  await target.setContextVars(vars, options);
}
