import { registerTag, registerAlias } from '../registry';

export type FlashConfig = { colors: Record<string, { color: string; durationMs: number }> };

const defaultConfig: FlashConfig = {
  colors: {
    white: { color: 'rgba(255,255,255,0.8)', durationMs: 400 },
    red: { color: 'rgba(255,0,0,0.5)', durationMs: 400 },
  },
};

registerTag<FlashConfig>({
  key: 'flash',
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const c = config.colors[args[0]] ?? config.colors.white;
    handlers.handleFlash(c.color, c.durationMs);
  },
});

registerAlias('f', 'flash');
