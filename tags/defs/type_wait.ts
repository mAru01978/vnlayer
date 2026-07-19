import { registerTag } from '../registry';

export type TypeWaitConfig = { readingBufferMs: number };

const defaultConfig: TypeWaitConfig = {
  // 文字を出し切った後、次の行に進むまでの「読み終わるための余韻」(ms)
  readingBufferMs: 1500,
};

registerTag<TypeWaitConfig>({
  key: 'type_wait',
  defaultConfig,
  run: ({ args, handlers, config }) => {
    handlers.setTypeWaitMode(args[0] === 'on', config.readingBufferMs);
  },
});
