import { registerTag } from '../registry';

registerTag({
  key: 'hide',
  run: ({ args, handlers }) => handlers.hideChar(args[0]),
});
