import { registerTag } from '../registry';
import { numericOrLabel } from '../numericOrLabel';
const defaultConfig = {
    durations: {
        short: 500,
        long: 1200,
        // 「少し時間が経ってから」を表現したい時用(例: 注文してからお酒が来るまで)。
        serve: 3000,
    },
};
// # wait:long のようなラベルに加えて、# wait:1500 のように生のms数値も直接指定できる。
registerTag({
    key: 'wait',
    defaultConfig,
    run: async ({ args, handlers, config }) => {
        const ms = numericOrLabel(args[0], config.durations, 500);
        await handlers.wait(ms);
    },
});
//# sourceMappingURL=wait.js.map