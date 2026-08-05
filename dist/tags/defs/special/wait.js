import { registerTag } from '../../registry';
import { numericOrLabel } from '../../numericOrLabel';
import * as waitManager from '../../../core/managers/waitManager';
import * as timelineManager from '../../../core/managers/timelineManager';
const defaultConfig = {
    durations: {
        short: 500,
        long: 1200,
        // 「少し時間が経ってから」を表現したい時用(例: 注文してからお酒が来るまで)。
        serve: 3000,
    },
};
// # wait:long のようなラベルに加えて、# wait:1500 のように生のms数値も直接
// 指定できる。加えて # wait:timeline という特別な値も受け付ける:
//   # wait:timeline → このVNインスタンスで現在進行中の全GSAP timeline
//                      (core/managers/timelineManager.ts)が完了するまで
//                      ink本文の進行を待つ。演出(#cam等)の所要時間を
//                      いちいち#waitのms値と手打ちで合わせなくても、
//                      「今動いてる演出が終わるまで」を表現できる。
//
// 実装はcore/managers/{wait,timeline}Managerに委譲。
//
// basic/special分離での位置づけ: 「値を1つのatomへ書き込む」のではなく
// 共有の非同期ユーティリティをそのまま呼ぶだけのタグなので、そもそも
// basicタグ化する動機が薄い(書き込み先のatomが無い)。specialタグとして
// 現状維持。
registerTag({
    key: 'wait',
    defaultConfig,
    run: async ({ args, handlers, config }) => {
        if (args[0] === 'timeline') {
            await timelineManager.waitForIdle(handlers.atomKey);
            return;
        }
        const ms = numericOrLabel(args[0], config.durations, 500);
        await waitManager.wait(handlers.atomKey, ms);
    },
});
//# sourceMappingURL=wait.js.map