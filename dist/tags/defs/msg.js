import { registerTag } from "../registry";
const defaultConfig = {
  transientDurationMs: 4000,
};
registerTag({
  key: "msg",
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const mode = args[0];
    if (mode === "hide") {
      handlers.setMessageMode("hide");
      return;
    }
    if (mode === "transient") {
      handlers.setMessageMode("transient", config.transientDurationMs);
      return;
    }
    // 'persist'(またはタグ無し)
    handlers.setMessageMode("persist");
  },
});
//# sourceMappingURL=msg.js.map
