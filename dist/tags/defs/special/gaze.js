import { registerTag, registerAlias } from "../../registry";
import { isNumeric } from "../../numericOrLabel";
// # gaze:alice:30:60 → aliceの視線を(originX=30, originY=60)へ向ける(%、ステージ全体基準)
// # gaze:alice:reset → 正面向きに戻す(矢印を消す)
//
// 想定用途: ホストページ側で VNLayer.notify("mouse", {x, y}) のようにマウス座標を
// 送り、Ink側で #tick:0.1 のような短い間隔のノットで event_mouse_seq をチェックして
// 変化していたら # gaze:alice:{mouseX}:{mouseY} を発行する、といった使い方を想定。
//
// basic/special分離での位置づけ: 書き込み先が`characters`(Record<name, ...>の
// 該当キーだけを部分更新)であり、`characters`自体は複雑な依存
// (setBgのautoHideOnBgChange連携、advance()内でのgazeの引き継ぎ処理等)を
// 持つため、まだatom化していない。そのためgazeも現状specialタグのまま。
registerTag({
  key: "gaze",
  run: ({ args, handlers }) => {
    const [name, xArg, yArg] = args;
    if (xArg === "reset") {
      handlers.setGaze(name, "reset");
      return;
    }
    if (isNumeric(xArg) && isNumeric(yArg)) {
      handlers.setGaze(name, { x: Number(xArg), y: Number(yArg) });
    }
  },
});
registerAlias("g", "gaze");
//# sourceMappingURL=gaze.js.map
