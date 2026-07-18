import { registerTag } from '../registry';

registerTag({
  key: 'choices',
  run: ({ args, handlers }) => handlers.setChoicesVisible(args[0] !== 'hide'),
});
