import { registerTag } from '../registry';

registerTag({
  key: 'clear',
  run: ({ handlers }) => handlers.clearLines(),
});
