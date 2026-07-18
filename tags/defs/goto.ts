import { registerTag } from '../registry';

registerTag({
  key: 'goto',
  run: ({ args, handlers }) => handlers.onGoto(args.join(':')),
});
