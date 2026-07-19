import { registerTag } from '../registry';
registerTag({
    key: 'bg',
    run: ({ args, handlers }) => handlers.setBg(args[0]),
});
//# sourceMappingURL=bg.js.map