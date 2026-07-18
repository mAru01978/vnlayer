import { registerTag } from '../registry';

export type TypeConfig = { speeds: Record<string, number> };

const defaultConfig: TypeConfig = {
  speeds: {
    super_slow: 150,
    slow: 70,
    normal: 30,
    fast: 12,
    // 停止/切り替え用: タイプライターを止めて即時表示に戻したい時
    off: 0,
  },
};

registerTag<TypeConfig>({
  key: 'type',
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const ms = config.speeds[args[0]];
    if (ms !== undefined) handlers.setTypeSpeed(ms);
  },
});
