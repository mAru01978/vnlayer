import { registerTag, registerAlias } from '../registry';
import { isNumeric } from '../numericOrLabel';

// # gaze:alice:30:60 → aliceの視線を(originX=30, originY=60)へ向ける(%、ステージ全体基準)
// # gaze:alice:reset → 正面向きに戻す(矢印を消す)
//
// 想定用途: ホストページ側で VNLayer.notify("mouse", {x, y}) のようにマウス座標を
// 送り、Ink側で #tick:0.1 のような短い間隔のノットで event_mouse_seq をチェックして
// 変化していたら # gaze:alice:{mouseX}:{mouseY} を発行する、といった使い方を想定。
registerTag({
  key: 'gaze',
  run: ({ args, handlers }) => {
    const [name, xArg, yArg] = args;
    if (xArg === 'reset') {
      handlers.setGaze(name, 'reset');
      return;
    }
    if (isNumeric(xArg) && isNumeric(yArg)) {
      handlers.setGaze(name, { x: Number(xArg), y: Number(yArg) });
    }
  },
});

registerAlias('g', 'gaze');
