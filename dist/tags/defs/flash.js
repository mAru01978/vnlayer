import { registerTag } from '../registry';
const defaultConfig = {
    colors: {
        white: { color: 'rgba(255,255,255,0.8)', durationMs: 400 },
        red: { color: 'rgba(255,0,0,0.5)', durationMs: 400 },
    },
};
registerTag({
    key: 'flash',
    defaultConfig,
    run: ({ args, handlers, config }) => {
        const c = config.colors[args[0]] ?? config.colors.white;
        handlers.handleFlash(c.color, c.durationMs);
    },
});
//# sourceMappingURL=flash.js.map