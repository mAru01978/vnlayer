import { registerBasicTag } from "../../registry";
import { isNumeric } from "../../numericOrLabel";
import { shakeAtomFamily } from "../../../core/atoms";
const defaultConfig = {
  presets: {
    short: { amplitude: 6, duration: 300 },
    long: { amplitude: 12, duration: 600 },
  },
};
// タグシステム大改修(Jotai導入)フェーズ1: basicタグ移行の第一号。
// 「ラベル/生の数値を解決してshakeAtomFamilyへ書き込むだけ」で完結する。
// ink側の書式は変わらない:
//   # shake:long のようなラベルに加えて、# shake:8:400(振幅:時間ms)のように
//   生の数値を直接指定することもできる。
//
// nonceはCSSアニメーションを毎回リスタートさせるための「値が変わったこと」
// マーカー。Date.now()を使い、前の値を知らなくても毎回一意な値になる。
registerBasicTag({
  key: "shake",
  defaultConfig,
  atomFamily: shakeAtomFamily,
  resolve: (args, config) => {
    if (isNumeric(args[0]) && isNumeric(args[1])) {
      return {
        nonce: Date.now(),
        amplitude: Number(args[0]),
        duration: Number(args[1]),
      };
    }
    const p = config.presets[args[0]] ?? config.presets.short;
    return { nonce: Date.now(), amplitude: p.amplitude, duration: p.duration };
  },
});
//# sourceMappingURL=shake.js.map
