import { registerTag } from '../registry';

registerTag({
  key: 's',
  run: ({ args, handlers }) => handlers.setSpeaker(args[0]),
});
