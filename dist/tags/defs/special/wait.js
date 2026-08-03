import { registerTag } from "../../registry";
import { numericOrLabel } from "../../numericOrLabel";
import * as waitManager from "../../../core/managers/waitManager";
const defaultConfig = {
  durations: {
    short: 500,
    long: 1200,
    // 「少し時間が経ってから」を表現したい時用(例: 注文してからお酒が来るまで)。
    serve: 3000,
  },
};
// # wait:long のようなラベルに加えて、# wait:1500 のように生のms数値も直接指定できる。
//
// 実装はcore/managers/waitManager.tsに委譲(中断可能な待ち、notify()による
// 即時打ち切り対応込み)。
//
// basic/special分離での位置づけ: 「値を1つのatomへ書き込む」のではなく
// waitManager.wait()という共有の非同期ユーティリティをそのまま呼ぶだけの
// タグなので、そもそもbasicタグ化する動機が薄い(書き込み先のatomが無い)。
// specialタグとして現状維持。
registerTag({
  key: "wait",
  defaultConfig,
  run: async ({ args, handlers, config }) => {
    const ms = numericOrLabel(args[0], config.durations, 500);
    await waitManager.wait(handlers.atomKey, ms);
  },
});
//# sourceMappingURL=wait.js.map
