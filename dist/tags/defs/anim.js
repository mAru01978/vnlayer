import { registerTag, registerAlias } from "../registry";
import { isNumeric } from "../numericOrLabel";
const defaultConfig = {
  speeds: {
    slow: 0.5,
    normal: 1,
    fast: 2,
  },
};
registerTag({
  key: "anim",
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const [name, mode, value] = args;
    if (!name || !mode) return;
    switch (mode) {
      case "motion":
        handlers.setAnim(name, value);
        break;
      case "loop":
        handlers.setAnimLoop(name, value);
        break;
      case "stop":
        handlers.setAnimStop(name);
        break;
      case "speed": {
        const speed = isNumeric(value) ? Number(value) : config.speeds[value];
        if (speed !== undefined) handlers.setAnimSpeed(name, speed);
        break;
      }
      case "reverse":
        handlers.setAnimReverse(name, value);
        break;
      default:
        handlers.onUnknownTag?.(
          ["anim", name, mode, value].filter(Boolean).join(":"),
        );
    }
  },
});
registerAlias("a", "anim");
//# sourceMappingURL=anim.js.map
