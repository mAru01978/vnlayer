import { registerTag } from '../registry';

export type CamConfig = {
  scales: Record<string, number>;
  durations: Record<string, number>;
};

const defaultConfig: CamConfig = {
  scales: {
    zoom: 1.6,
    // ズームアウト。特定のキャラを画面いっぱいに見せるzoomとは逆に、引きの画にしたい時用。
    zoomout: 0.8,
    reset: 1.0,
  },
  durations: {
    zoom: 500,
    zoomout: 500,
    reset: 500,
  },
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

registerTag<CamConfig>({
  key: 'cam',
  defaultConfig,
  run: async ({ args, handlers, config }) => {
    const motion = args[0];
    const target = args[1];
    const scale = config.scales[motion] ?? config.scales.reset;
    const duration = config.durations[motion] ?? config.durations.reset;
    handlers.setCamera(scale, target, duration);
    if (duration) await sleep(duration);
  },
});
