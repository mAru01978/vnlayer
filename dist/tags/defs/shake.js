import { registerTag } from '../registry';
import { isNumeric } from '../numericOrLabel';
const defaultConfig = {
    presets: {
        short: { amplitude: 6, duration: 300 },
        long: { amplitude: 12, duration: 600 },
    },
};
// # shake:long のようなラベルに加えて、# shake:8:400(振幅:時間ms)のように
// 生の数値を直接指定することもできる。
registerTag({
    key: 'shake',
    defaultConfig,
    run: ({ args, handlers, config }) => {
        if (isNumeric(args[0]) && isNumeric(args[1])) {
            handlers.shakeScreen(Number(args[0]), Number(args[1]));
            return;
        }
        const p = config.presets[args[0]] ?? config.presets.short;
        handlers.shakeScreen(p.amplitude, p.duration);
    },
});
//# sourceMappingURL=shake.js.map