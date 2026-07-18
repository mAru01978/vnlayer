import { registerTag } from '../registry';

registerTag({
  key: 'msgfade',
  run: ({ args, handlers }) => handlers.setNextRevealFade(args[0] === 'in'),
});
