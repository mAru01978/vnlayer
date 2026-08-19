import { registerTag } from "../../registry";
import { isNumeric, parseOnOff } from "../../numericOrLabel";
import { emitToInstance, emitToSelf } from "../../../core/instanceRegistry";
import { reportError, TagDispatchError } from "../../../core/errors";

// #emit はVN間イベント連携、および同一Ink(自分自身)への通知を行うタグ。
// 他の「このVNインスタンス自身」を操作する各種タグ(#s, #bg, #cam等)と違い、
// #emitだけは書式(引数の数)で送信先が切り替わる:
//
//   # emit:@vn2:vn_event_ping:true   (3引数: 別VNインスタンスへ)
//   # emit:vn2:vn_event_ping:true    (同上、"@"は無くても同じ意味)
//     → 別のVNインスタンス("#vn2"としてmount()されたもの)のink変数
//       vn_event_ping に true を書き込む。selectorは"#"を付けずに書くか
//       (inkは行の途中に"#"が現れると別のタグとして分割してしまうため)、
//       代わりに"@"を使って明示してもよい("@vn2"は"#vn2"と同じ意味)。
//     対象インスタンスが未マウントの場合は警告を出して何もしない
//     (呼び出し元のシナリオは止まらない)。
//
//   # emit:pending_click:1000        (2引数: 同一Ink=自分自身へ)
//     → selectorを省略した形。#interruptを同じinkファイル内から起点にしたい
//       場合に使う(素のink代入 ~ pending_click = 1 でもObserveVariableは
//       発火するが、こちらはVNLayer.setContext(...,{notify:true})と同じ
//       経路(_seq自動採番/#wait・type_wait待ちの即時打ち切り/event_loopの
//       #interrupt付き選択肢への自動遷移マーク)にも一緒に乗る点が異なる)。
//
// どちらの形も expose:false固定(VNLayer.getContext()からは見えない、
// あくまで内部連携用)・notify:true固定。
//
// 値はisNumeric()なら数値、on/offならbooleanとして解釈し、それ以外は
// 文字列のまま渡す(他のタグと同じ変換ルール)。
//
// 注意: 「ink→ブラウザ(host JS)」への通知は#web:emit(tags/defs/special/web.ts、
// core/managers/webManager.ts)を使う。#emitはVN(ink変数)向けの通知専用で、
// ブラウザ側へは直接何も届かない。
//
// 実装はcore/instanceRegistry.tsのemitToInstance()/emitToSelf()に直接
// 委譲する。3引数(他VN宛)はselector(公開スコープ識別子)ベースのMap、
// 2引数(自分宛)はatomKeyベースの別Mapを見る(instanceId未指定のインスタンス
// でも自己通知だけは必ず動くようにするため)。
//
// basic/special分離での位置づけ: 書き込み先が「このVNインスタンス自身の
// atom」ではなく「(自分を含む)VNインスタンスのink変数」であり、
// atomFamily(atomKey)という設計そのものと噛み合わないため、specialタグ
// として現状維持。
function resolveValue(rawValue: string | undefined): unknown {
  if (isNumeric(rawValue)) return Number(rawValue);
  const on = parseOnOff(rawValue);
  return on !== undefined ? on : rawValue;
}

registerTag({
  key: "emit",
  run: ({ args, handlers }) => {
    if (args.length >= 3) {
      // # emit:<selector>:<varName>:<value> (別VNインスタンスへ)
      const [selector, varName, rawValue] = args;
      if (!selector || !varName) {
        throw new TagDispatchError(
          `emit の書式が不正です(# emit:<selector>:<varName>:<value>): ${args.join(":")}`,
        );
        return;
      }
      emitToInstance(
        selector,
        { [varName]: resolveValue(rawValue) },
        { notify: true, expose: false },
      );
      return;
    }

    // # emit:<varName>:<value> (同一Ink=自分自身へ)
    const [varName, rawValue] = args;
    if (!varName) {
      throw new TagDispatchError(
        `emit の書式が不正です(# emit:<varName>:<value> または # emit:<selector>:<varName>:<value>): ${args.join(":")}`,
      );
      return;
    }
    emitToSelf(
      handlers.atomKey,
      { [varName]: resolveValue(rawValue) },
      { notify: true, expose: false },
    );
  },
});
