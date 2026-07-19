import { registerTag } from '../registry';
import { isNumeric } from '../numericOrLabel';
const defaultConfig = {
    speeds: {
        slow: 0.5,
        normal: 1,
        fast: 2,
    },
};
// # anim_speed:名前:normal のようなラベルに加えて、# anim_speed:名前:1.5 のように
// 生の倍率を直接指定することもできる(1 = 通常速度)。
registerTag({
    key: 'anim_speed',
    defaultConfig,
    run: ({ args, handlers, config }) => {
        const [name, raw] = args;
        const speed = isNumeric(raw) ? Number(raw) : config.speeds[raw];
        if (name && speed !== undefined)
            handlers.setAnimSpeed(name, speed);
    },
});
//# sourceMappingURL=anim_speed.js.map