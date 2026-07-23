import { registerTag, registerAlias } from '../registry';
import { isNumeric } from '../numericOrLabel';

// #anim は以前分かれていた anim / anim_loop / anim_stop / anim_speed / anim_reverse
// を1つにまとめた統合タグ。2番目の引数(mode)でどの操作かを切り替える:
//
//   # anim:alice:motion:walk   → 1回再生(旧#anim)
//   # anim:alice:loop:walk     → ループ再生(旧#anim_loop)
//   # anim:alice:stop          → 停止(旧#anim_stop)
//   # anim:alice:speed:slow    → 再生速度(旧#anim_speed、ラベルまたは生の倍率)
//   # anim:alice:reverse:walk  → 逆再生(旧#anim_reverse)
export type AnimConfig = { speeds: Record<string, number> };

const defaultConfig: AnimConfig = {
  speeds: {
    slow: 0.5,
    normal: 1,
    fast: 2,
  },
};

registerTag<AnimConfig>({
  key: 'anim',
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const [name, mode, value] = args;
    if (!name || !mode) return;

    switch (mode) {
      case 'motion':
        handlers.setAnim(name, value);
        break;
      case 'loop':
        handlers.setAnimLoop(name, value);
        break;
      case 'stop':
        handlers.setAnimStop(name);
        break;
      case 'speed': {
        const speed = isNumeric(value) ? Number(value) : config.speeds[value];
        if (speed !== undefined) handlers.setAnimSpeed(name, speed);
        break;
      }
      case 'reverse':
        handlers.setAnimReverse(name, value);
        break;
      default:
        handlers.onUnknownTag?.(['anim', name, mode, value].filter(Boolean).join(':'));
    }
  },
});

registerAlias('a', 'anim');
