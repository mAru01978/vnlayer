import { registerTag, warnUnknownTag } from "../../registry";
import * as interruptManager from "../../../core/managers/interruptManager";
// #interrupt はSwitchFlow+ObserveVariable前提の割り込みを許可するタグ。
// 「置いた瞬間だけ効く使い捨てマーカー」ではなく、明示的にclearするまで
// ずっと有効な常設の許可(詳細はcore/managers/interruptManager.ts参照)。
//
//   # interrupt:on_blink:pending_blink       → pending_blinkがnotifyされたら on_blink へ割り込み許可
//   # interrupt:on_char_click:pending_click  → 同様(変数名は自由に決めてよい)
//   # interrupt:clear                        → このVNインスタンスの許可を全部解除
//   # interrupt:clear:pending_blink          → pending_blinkの許可だけ解除
//
// 割り込み先のknotは選択肢を出してもよい(何段階でもOK)。ユーザーが
// その選択肢を選ぶ間は通常のVNLayer.choose相当の操作で進み、knotが
// 完全に終わった(選択肢もcontinueも尽きた)時点で自動的に元のフローへ
// 戻る(core/managers/interruptManager.tsのSwitchFlow管理を参照)。
//
// 実装はcore/managers/interruptManager.tsに委譲。#tick(ポーリング用、
// +[#tick:0.1] -> knot の形で選択肢待ちの中でしか使えない)とは役割分担が
// 完全に分かれる: #interruptはイベント駆動専用。
registerTag({
    key: "interrupt",
    run: ({ args, handlers }) => {
        const { atomKey } = handlers;
        const [first, second] = args;
        if (first === "clear") {
            if (second) {
                interruptManager.clearVar(atomKey, second);
            }
            else {
                interruptManager.clearAll(atomKey);
            }
            return;
        }
        const knot = first;
        const varName = second;
        if (!knot || !varName) {
            warnUnknownTag(["interrupt", ...args].filter(Boolean).join(":"));
            return;
        }
        interruptManager.registerPermission(atomKey, knot, varName);
    },
});
//# sourceMappingURL=interrupt.js.map