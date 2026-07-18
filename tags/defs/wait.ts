import { registerTag } from '../registry';

export type WaitConfig = { durations: Record<string, number> };

const defaultConfig: WaitConfig = {
  durations: {
    short: 500,
    long: 1200,
    // 「少し時間が経ってから」を表現したい時用(例: 注文してからお酒が来るまで)。
    serve: 3000,
  },
};

registerTag<WaitConfig>({
  key: 'wait',
  defaultConfig,
  run: async ({ args, handlers, config }) => {
    const ms = config.durations[args[0]] ?? 500;
    await handlers.wait(ms);
  },
});
