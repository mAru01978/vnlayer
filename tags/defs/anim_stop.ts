import { registerTag } from '../registry';

// # anim_stop:名前 → 再生中のモーションを止める(表情expressionはそのまま維持)
registerTag({
  key: 'anim_stop',
  run: ({ args, handlers }) => handlers.setAnimStop(args[0]),
});
