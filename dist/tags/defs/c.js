import { registerTag } from "../registry";
registerTag({
  key: "c",
  run: ({ args, handlers }) => handlers.setChar(args[0], args[1]),
});
//# sourceMappingURL=c.js.map
