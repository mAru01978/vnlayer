import { registerBasicTag, registerAlias } from "../../registry";
import { isNumeric } from "../../numericOrLabel";
import { camAtomFamily } from "../../../core/atoms";
import { positionOverridesAtomFamily } from "../../../core/managers/positionManager";
import { getCharacterSlot } from "../../characterSlots";
const defaultConfig = {
  scales: {
    zoom: 1.6,
    // ズームアウト。特定のキャラを画面いっぱいに見せるzoomとは逆に、引きの画にしたい時用。
    zoomout: 0.8,
    reset: 1.0,
  },
  durations: {
    zoom: 500,
    zoomout: 500,
    reset: 500,
  },
};
// タグシステム大改修(Jotai導入)フェーズ2: #camをregisterBasicTag経由に移行。
//
// #shakeと違い、#camは「対象キャラの現在位置(#s:...:posでの一時的な上書きを
// 含む)」を見て originX/originY を決める必要があるため、resolve()の第3引数
// helpers(store経由でpositionOverridesAtomFamily/camAtomFamily自身の現在値を
// 読む)を使っている。positionOverridesもatom化されている(core/managers/
// positionManager.ts)ため、store.get()だけで同期的に現在値を読める。
//
// 移動の所要時間(duration)ぶん待ってから次のタグ/文章へ進む挙動は
// resolveWaitMsで表現している(内部的にはcore/managers/waitManager.tsを
// 経由するため、#wait等と同じくnotify()による即時打ち切りの対象になる)。
//
// ink側の書式は変わらない:
//   # cam:zoom:alice / # cam:1.8:alice(生の倍率) / # cam:zoom:alice:650(時間上書き)
registerBasicTag({
  key: "cam",
  defaultConfig,
  atomFamily: camAtomFamily,
  resolve: (args, config, { atomKey, store }) => {
    const motion = args[0];
    const target = args[1];
    const scale = isNumeric(motion)
      ? Number(motion)
      : (config.scales[motion] ?? config.scales.reset);
    const prev = store.get(camAtomFamily(atomKey));
    const overrides = store.get(positionOverridesAtomFamily(atomKey));
    const slot = target
      ? (overrides[target] ??
        getCharacterSlot(target) ?? {
          originX: prev.originX,
          originY: prev.originY,
        })
      : { originX: prev.originX, originY: prev.originY };
    return {
      target: target ?? prev.target,
      scale,
      originX: slot.originX,
      originY: slot.originY,
    };
  },
  resolveWaitMs: (args, config) => {
    const motion = args[0];
    const labelDuration = config.durations[motion] ?? config.durations.reset;
    return isNumeric(args[2]) ? Number(args[2]) : labelDuration;
  },
});
// 旧#c(キャラ表情タグ)は#sに統合されて廃止されたため、頭文字'c'が
// 空いている。#camの短縮形として使えるようにする(# c:zoom:alice)。
registerAlias("c", "cam");
//# sourceMappingURL=cam.js.map
