import { registerTag } from '../registry';

export type TypewaitConfig = { readingBufferMs: number };

const defaultConfig: TypewaitConfig = {
  // 文字を出し切った後、次の行に進むまでの「読み終わるための余韻」(ms)
  readingBufferMs: 1500,
};

registerTag<TypewaitConfig>({
  key: 'typewait',
  defaultConfig,
  run: ({ args, handlers, config }) => {
    handlers.setTypeWaitMode(args[0] === 'on', config.readingBufferMs);
  },
});
