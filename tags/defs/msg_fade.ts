import { registerTag } from '../registry';

// # msg_fade:in
registerTag({
  key: 'msg_fade',
  run: ({ args, handlers }) => handlers.setNextRevealFade(args[0] === 'in'),
});
