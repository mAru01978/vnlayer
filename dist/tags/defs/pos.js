import { registerTag } from "../registry";
import { isNumeric } from "../numericOrLabel";
const defaultConfig = {
  presets: {
    center: { originX: 50, originY: 50 },
  },
};
// # pos:alice:center のようなラベルに加えて、# pos:alice:30:60 のように
// 生の座標(originX:originY、%)を直接指定することもできる。
registerTag({
  key: "pos",
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const [name, a1, a2] = args;
    if (a1 === "reset") {
      handlers.setPos(name, "reset");
      return;
    }
    if (isNumeric(a1) && isNumeric(a2)) {
      handlers.setPos(name, { originX: Number(a1), originY: Number(a2) });
      return;
    }
    const coords = config.presets[a1];
    if (coords) handlers.setPos(name, coords);
  },
});
//# sourceMappingURL=pos.js.map
