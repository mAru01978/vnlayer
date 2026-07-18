import { registerTag } from '../registry';

export type PosConfig = { presets: Record<string, { originX: number; originY: number }> };

const defaultConfig: PosConfig = {
  presets: {
    center: { originX: 50, originY: 50 },
  },
};

registerTag<PosConfig>({
  key: 'pos',
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const [name, preset] = args;
    if (preset === 'reset') {
      handlers.setPos(name, 'reset');
      return;
    }
    const coords = config.presets[preset];
    if (coords) handlers.setPos(name, coords);
  },
});
