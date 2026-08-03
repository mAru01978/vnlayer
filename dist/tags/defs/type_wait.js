import { registerTag } from "../registry";
const defaultConfig = {
  // 文字を出し切った後、次の行に進むまでの「読み終わるための余韻」(ms)
  readingBufferMs: 1500,
};
registerTag({
  key: "type_wait",
  defaultConfig,
  run: ({ args, handlers, config }) => {
    handlers.setTypeWaitMode(args[0] === "on", config.readingBufferMs);
  },
});
//# sourceMappingURL=type_wait.js.map
