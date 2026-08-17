import { registerTag, registerAlias, warnUnknownTag } from "../../registry";
import { isNumeric } from "../../numericOrLabel";
import * as characterManager from "../../../core/managers/characterManager";

// #anim は以前分かれていた anim / anim_loop / anim_stop / anim_speed / anim_reverse
// を1つにまとめた統合タグ。2番目の引数(mode)でどの操作かを切り替える:
//
//   # anim:alice:motion:walk   → 1回再生(旧#anim)
//   # anim:alice:loop:walk     → ループ再生(旧#anim_loop)
//   # anim:alice:stop          → 停止(旧#anim_stop)
//   # anim:alice:speed:slow    → 再生速度(旧#anim_speed、ラベルまたは生の倍率)
//   # anim:alice:reverse:walk  → 逆再生(旧#anim_reverse)
//
// 実装はcore/managers/characterManager.tsに委譲。
// basic/special分離での位置づけ: mode(motion/loop/stop/speed/reverse)ごとに
// 呼び先が異なる分岐タグのため、specialタグとして現状維持
// (core/useStoryEngine.tsは一切経由しない)。
export type AnimConfig = { speeds: Record<string, number> };

const defaultConfig: AnimConfig = {
  speeds: {
    slow: 0.5,
    normal: 1,
    fast: 2,
  },
};

registerTag<AnimConfig>({
  key: "anim",
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const [name, mode, value] = args;
    if (!name || !mode) return;
    const { atomKey } = handlers;

    switch (mode) {
      case "motion":
        characterManager.setAnimMotion(atomKey, name, value);
        break;
      case "loop":
        characterManager.setAnimLoop(atomKey, name, value);
        break;
      case "stop":
        characterManager.setAnimStop(atomKey, name);
        break;
      case "speed": {
        const speed = isNumeric(value) ? Number(value) : config.speeds[value];
        if (speed !== undefined)
          characterManager.setAnimSpeed(atomKey, name, speed);
        break;
      }
      case "reverse":
        characterManager.setAnimReverse(atomKey, name, value);
        break;
      case "z": {
        if (isNumeric(value)) {
          characterManager.setZIndex(atomKey, name, Number(value));
        }
        break;
      }
      default:
        warnUnknownTag(["anim", name, mode, value].filter(Boolean).join(":"));
    }
  },
});

registerAlias("a", "anim");
