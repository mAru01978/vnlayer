import { registerTag } from "../registry";
// # anim_loop:名前:モーション → そのモーションをループ再生させる
registerTag({
  key: "anim_loop",
  run: ({ args, handlers }) => handlers.setAnimLoop(args[0], args[1]),
});
//# sourceMappingURL=anim_loop.js.map
