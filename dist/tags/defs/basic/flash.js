import { registerBasicTag, registerAlias } from "../../registry";
import { flashAtomFamily } from "../../../core/atoms";
const defaultConfig = {
  colors: {
    white: { color: "rgba(255,255,255,0.8)", durationMs: 400 },
    red: { color: "rgba(255,0,0,0.5)", durationMs: 400 },
  },
};
// タグシステム大改修(Jotai導入)フェーズ2: #flashをregisterBasicTag経由に移行。
// 「色を書き込む→durationMs後に自動でnullへ戻す」という挙動を
// resolveClearAfterMs/clearValueで表現している(ストーリー進行はブロックしない、
// setTimeoutのfire-and-forget)。
//
// ink側の書式は変わらない: # flash:white / # flash:red
registerBasicTag({
  key: "flash",
  defaultConfig,
  atomFamily: flashAtomFamily,
  resolve: (args, config) => {
    const c = config.colors[args[0]] ?? config.colors.white;
    return { color: c.color, durationMs: c.durationMs };
  },
  resolveClearAfterMs: (args, config) =>
    (config.colors[args[0]] ?? config.colors.white).durationMs,
  clearValue: null,
});
registerAlias("f", "flash");
//# sourceMappingURL=flash.js.map
