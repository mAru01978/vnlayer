import { registerBasicTag } from "../registry";
import { isNumeric } from "../numericOrLabel";
import { shakeAtomFamily } from "../../core/atoms";
const defaultConfig = {
  presets: {
    short: { amplitude: 6, duration: 300 },
    long: { amplitude: 12, duration: 600 },
  },
};
// タグシステム大改修(Jotai導入)フェーズ1: basicタグ移行の第一号。
// 「ラベル/生の数値を解決してshakeAtomFamilyへ書き込むだけ」で完結するため、
// registerTag({run:...}) + handlers.shakeScreen 経由から
// registerBasicTag({resolve, atomFamily}) 経由に切り替えた。
// tags/sceneHandlers.tsのshakeScreenやcore/useStoryEngine.ts側の実装を
// 一切変更せずにこのタグ単体だけ移行できる(=basic/special分離の狙いどおり)。
//
// ink側の書式は変わらない:
//   # shake:long のようなラベルに加えて、# shake:8:400(振幅:時間ms)のように
//   生の数値を直接指定することもできる。
//
// nonceはCSSアニメーションを毎回リスタートさせるための「値が変わったこと」
// マーカー。以前は`prev.nonce + 1`のようにReact stateの前の値を参照して
// インクリメントしていたが、basicタグは「前の値を読まず、新しい値を
// 決定して書き込むだけ」という設計にしたいため、Date.now()を使い、
// 前の値を知らなくても毎回一意な値になるようにしている。
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
