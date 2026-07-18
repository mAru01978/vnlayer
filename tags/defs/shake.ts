import { registerTag } from '../registry';

export type ShakeConfig = { presets: Record<string, { amplitude: number; duration: number }> };

const defaultConfig: ShakeConfig = {
  presets: {
    short: { amplitude: 6, duration: 300 },
    long: { amplitude: 12, duration: 600 },
  },
};

registerTag<ShakeConfig>({
  key: 'shake',
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const p = config.presets[args[0]] ?? config.presets.short;
    handlers.shakeScreen(p.amplitude, p.duration);
  },
});
