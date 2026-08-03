import { registerTag, registerAlias } from "../../registry";
import { isNumeric } from "../../numericOrLabel";
import * as typeManager from "../../../core/managers/typeManager";

// #type は以前分かれていた type / type_wait を1つにまとめた統合タグ。
// 一番よく使う「速度指定」は今まで通り2番目の引数をそのまま書けばよく、
// (旧type_wait分の)読み終わり待ちのON/OFFだけ明示的なmode指定にする:
//
//   # type:slow       → 速度指定(旧#type:slow、ラベルまたは生のms数値)
//   # type:wait:on    → 読み終わり待ちON(旧#type_wait:on)
//   # type:wait:off   → 読み終わり待ちOFF(旧#type_wait:off)
export type TypeConfig = {
  speeds: Record<string, number>;
  readingBufferMs: number;
};

const defaultConfig: TypeConfig = {
  speeds: {
    super_slow: 150,
    slow: 70,
    normal: 30,
    fast: 12,
    // 停止/切り替え用: タイプライターを止めて即時表示に戻したい時
    off: 0,
  },
  // 文字を出し切った後、次の行に進むまでの「読み終わるための余韻」(ms)
  readingBufferMs: 1500,
};

// 実装はcore/managers/typeManager.tsに委譲。
//
// basic/special分離での位置づけ: 「速度指定」部分だけならtypeSpeedAtomFamilyへの
// 単純な書き込みでbasicタグ化できそうに見えるが、「wait:on/off」部分は
// atomではなくtypeManagerが持つ「読み終わり待ちの有効/バッファ」という
// 別種の内部設定を切り替えるだけの操作で、こちらは1つのatomへの書き込み
// という形にならない。1つのタグの中に異なる種類の副作用が混在するため、
// 無理にbasic化せずspecialタグとして現状維持している。
registerTag<TypeConfig>({
  key: "type",
  defaultConfig,
  run: ({ args, handlers, config }) => {
    if (args[0] === "wait") {
      typeManager.setTypeWaitMode(
        handlers.atomKey,
        args[1] === "on",
        config.readingBufferMs,
      );
      return;
    }
    const ms = isNumeric(args[0]) ? Number(args[0]) : config.speeds[args[0]];
    if (ms !== undefined) typeManager.setTypeSpeed(handlers.atomKey, ms);
  },
});

registerAlias("t", "type");
