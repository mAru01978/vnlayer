import { registerTag, registerAlias } from "../../registry";
import { isNumeric } from "../../numericOrLabel";
import { setCharacterSlots } from "../../characterSlots";
import * as speakerManager from "../../../core/managers/speakerManager";
import * as characterManager from "../../../core/managers/characterManager";
import * as positionManager from "../../../core/managers/positionManager";
const defaultConfig = {
  posPresets: {
    center: { originX: 50, originY: 50 },
  },
};
registerTag({
  key: "sprite",
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const { atomKey, instanceId } = handlers;
    const [name, mode, ...rest] = args;
    // 重要: ここで即座にsetSpeakerを呼ぶ。core/inkStepRunner.tsは「テキストを
    // 伴う行でだけ」話者state(speaker)を更新するため、# s:mika:happy のように
    // タグだけで文章を伴わない行では、その場では画面上のspeaker stateがまだ
    // 古い話者のままになる(CharacterSpriteの薄い表示バグの原因だった)。
    // ここで#s/#spriteタグが来た時点で即座にsetSpeakerしておけば、そのズレが起きない。
    if (name) speakerManager.setSpeaker(atomKey, name);
    if (!name || mode === undefined) return; // 話者だけの指定(# s:alice)は何もしない
    if (mode === "hide") {
      characterManager.hideCharacter(atomKey, instanceId, name);
      return;
    }
    if (mode === "initPos") {
      const [x, y] = rest;
      if (isNumeric(x) && isNumeric(y)) {
        setCharacterSlots({
          [name]: { originX: Number(x), originY: Number(y) },
        });
      }
      return;
    }
    if (mode === "pos") {
      const [p1, p2, p3] = rest;
      if (p1 === "reset") {
        positionManager.setPos(atomKey, name, "reset");
        return;
      }
      if (isNumeric(p1) && isNumeric(p2)) {
        // pos:x:y か pos:x:y:durationMs か
        const durationMs = isNumeric(p3) ? Number(p3) : undefined;
        positionManager.setPos(
          atomKey,
          name,
          { originX: Number(p1), originY: Number(p2) },
          durationMs,
        );
        return;
      }
      // pos:プリセット名 か pos:プリセット名:durationMs か
      const coords = config.posPresets[p1];
      if (coords) {
        const durationMs = isNumeric(p2) ? Number(p2) : undefined;
        positionManager.setPos(atomKey, name, coords, durationMs);
      }
      return;
    }
    // それ以外(hide/pos/initPos以外の単語)は表情指定として扱う
    characterManager.setExpression(atomKey, name, mode);
  },
});
registerAlias("s", "sprite");
//# sourceMappingURL=sprite.js.map
