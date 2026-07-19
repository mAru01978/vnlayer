import { registerTag } from '../registry';
import { isNumeric } from '../numericOrLabel';
const defaultConfig = {
    scales: {
        zoom: 1.6,
        // ズームアウト。特定のキャラを画面いっぱいに見せるzoomとは逆に、引きの画にしたい時用。
        zoomout: 0.8,
        reset: 1.0,
    },
    durations: {
        zoom: 500,
        zoomout: 500,
        reset: 500,
    },
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// # cam:zoom:alice のようなラベルに加えて、# cam:1.8:alice のように
// 生の倍率(scale)を直接指定することもできる。第3引数で時間(ms)も
// 個別に上書きできる(例: # cam:1.8:alice:650、# cam:zoom:alice:650)。
registerTag({
    key: 'cam',
    defaultConfig,
    run: async ({ args, handlers, config }) => {
        const motion = args[0];
        const target = args[1];
        const scale = isNumeric(motion) ? Number(motion) : config.scales[motion] ?? config.scales.reset;
        const labelDuration = config.durations[motion] ?? config.durations.reset;
        const duration = isNumeric(args[2]) ? Number(args[2]) : labelDuration;
        handlers.setCamera(scale, target, duration);
        if (duration)
            await sleep(duration);
    },
});
//# sourceMappingURL=cam.js.map