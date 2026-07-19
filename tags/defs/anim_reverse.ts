import { registerTag } from '../registry';

// # anim_reverse:名前:モーション → そのモーションを逆再生させる
registerTag({
  key: 'anim_reverse',
  run: ({ args, handlers }) => handlers.setAnimReverse(args[0], args[1]),
});
