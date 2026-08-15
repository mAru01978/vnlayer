import { registerBasicTag, registerAlias } from "../../registry";
import { isNumeric } from "../../numericOrLabel";
import { charactersAtomFamily } from "../../../core/managers/characterManager";
// タグシステム大改修(Jotai導入)フェーズ3: #gazeをregisterBasicTag経由に移行。
// characters(Record<name, CharacterState>)をatom化したことで、gazeが
// 「1つのキャラのgazeフィールドだけを書き換えた新しいcharacters全体」を
// 1つのatomへの書き込みとして表現できるようになった(以前はcharactersが
// まだatom化されておらずuseState経由だったためspecialタグ扱いだった)。
//
// charactersAtomFamily自体の実体はcore/managers/characterManager.tsが
// 所有している(#anim/#sprite等、他の複数のタグからも書き込まれる状態の
// ため)。gazeタグはそこに定義済みのatomFamilyを再利用するだけで、
// 専用のマネージャー関数は持たない(store.get/setだけで完結するため)。
//
// # gaze:alice:30:60 → aliceの視線を(originX=30, originY=60)へ向ける(%、ステージ全体基準)
// # gaze:alice:reset → 正面向きに戻す(矢印を消す)
registerBasicTag({
  key: "gaze",
  atomFamily: charactersAtomFamily,
  resolve: (args, _config, { atomKey, store }) => {
    const [name, xArg, yArg] = args;
    const prev = store.get(charactersAtomFamily(atomKey));
    if (xArg === "reset") {
      if (!prev[name]) return undefined; // 元々居ない/視線が無いキャラへのresetは何もしない
      const { gaze: _drop, ...rest } = prev[name];
      return { ...prev, [name]: rest };
    }
    if (isNumeric(xArg) && isNumeric(yArg)) {
      const base = prev[name] ?? { expression: "normal" };
      return {
        ...prev,
        [name]: { ...base, gaze: { x: Number(xArg), y: Number(yArg) } },
      };
    }
    return undefined;
  },
});
registerAlias("g", "gaze");
//# sourceMappingURL=gaze.js.map
