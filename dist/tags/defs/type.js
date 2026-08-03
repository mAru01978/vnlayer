import { registerTag, registerAlias } from "../registry";
import { isNumeric } from "../numericOrLabel";
const defaultConfig = {
  speeds: {
    super_slow: 150,
    slow: 70,
    normal: 30,
    fast: 12,
    // 停止/切り替え用: タイプライターを止めて即時表示に戻したい時
    off: 0,
  },
  // 文字を出し切った後、次の行に進むまでの「読み終わるための余韻」(ms)
  readingBufferMs: 1500,
};
registerTag({
  key: "type",
  defaultConfig,
  run: ({ args, handlers, config }) => {
    if (args[0] === "wait") {
      handlers.setTypeWaitMode(args[1] === "on", config.readingBufferMs);
      return;
    }
    const ms = isNumeric(args[0]) ? Number(args[0]) : config.speeds[args[0]];
    if (ms !== undefined) handlers.setTypeSpeed(ms);
  },
});
registerAlias("t", "type");
//# sourceMappingURL=type.js.map
