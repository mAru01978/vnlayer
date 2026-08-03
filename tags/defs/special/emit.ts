import { registerTag } from "../../registry";
import { isNumeric, parseOnOff } from "../../numericOrLabel";
import { emitToInstance } from "../../../core/instanceRegistry";

// #emit はVN間イベント連携専用のタグ。他の「このVNインスタンス自身」を
// 操作する各種タグ(#s, #bg, #cam等)と違い、#emitだけは指定した別の
// VNインスタンス(selector、mount()時に渡したものと同じ文字列)へ向けて
// 一方通行で値を送る。
//
//   # emit:vn2:vn_event_ping:true
//   # emit:@vn2:vn_event_ping:true   (どちらも同じ意味)
//     → 別のVNインスタンス("#vn2"としてmount()されたもの)のink変数
//       vn_event_ping に true を書き込む。selectorは"#"を付けずに書くか
//       (inkは行の途中に"#"が現れると別のタグとして分割してしまうため)、
//       代わりに"@"を使って明示してもよい("@vn2"は"#vn2"と同じ意味)。
//       expose:false固定(送り先の VNLayer.getContext() からは見えない、
//       あくまでVN間の内部連携用)。notify:true固定(書き込みと同時に
//       #vn2側の#wait:/type_wait待ちを即座に打ち切り、event_loop等の
//       #interrupt付き選択肢に辿り着き次第それを自動選択する)。
//     対象インスタンスが未マウントの場合は警告を出して何もしない
//     (呼び出し元のシナリオは止まらない)。
//
// 値はisNumeric()なら数値、on/offならbooleanとして解釈し、それ以外は
// 文字列のまま渡す(他のタグと同じ変換ルール)。
//
// 注意: 「ink→ブラウザ(host JS)」への通知は#web:emit(tags/defs/special/web.ts、
// core/managers/webManager.ts)を使う。#emitはVN(ink)同士の連携専用で、
// ブラウザ側へは直接何も届かない。
//
// 実装はcore/instanceRegistry.tsのemitToInstance()に直接委譲する
// (このマネージャーはmount()時のselector文字列で他インスタンスを検索する
// 仕組みなので、このタグ自身のatomKey/instanceIdは一切使わない)。
//
// basic/special分離での位置づけ: 書き込み先が「このVNインスタンス自身の
// atom」ではなく「他のVNインスタンスのink変数」であり、atomFamily(atomKey)
// という設計そのものと噛み合わない(他インスタンスをターゲットにする)ため、
// specialタグとして現状維持。
registerTag({
  key: "emit",
  run: ({ args }) => {
    const [selector, varName, rawValue] = args;
    if (!selector || !varName) {
      console.warn(
        `[VNLayer] emit の書式が不正です(# emit:<selector>:<varName>:<value>): ${args.join(":")}`,
      );
      return;
    }

    let value: unknown = rawValue;
    if (isNumeric(rawValue)) {
      value = Number(rawValue);
    } else {
      const on = parseOnOff(rawValue);
      if (on !== undefined) value = on;
    }

    emitToInstance(
      selector,
      { [varName]: value },
      { notify: true, expose: false },
    );
  },
});
