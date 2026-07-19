import { registerTag } from '../registry';
registerTag({
    key: 'anim',
    run: ({ args, handlers }) => handlers.setAnim(args[0], args[1]),
});
//# sourceMappingURL=anim.js.map