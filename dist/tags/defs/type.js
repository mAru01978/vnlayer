import { registerTag } from '../registry';
import { isNumeric } from '../numericOrLabel';
const defaultConfig = {
    speeds: {
        super_slow: 150,
        slow: 70,
        normal: 30,
        fast: 12,
        // 停止/切り替え用: タイプライターを止めて即時表示に戻したい時
        off: 0,
    },
};
// # type:slow のようなラベルに加えて、# type:45 のように生のms数値も直接指定できる。
registerTag({
    key: 'type',
    defaultConfig,
    run: ({ args, handlers, config }) => {
        const ms = isNumeric(args[0]) ? Number(args[0]) : config.speeds[args[0]];
        if (ms !== undefined)
            handlers.setTypeSpeed(ms);
    },
});
//# sourceMappingURL=type.js.map