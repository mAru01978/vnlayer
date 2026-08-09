import { registerTag, registerAlias } from "../../registry";
import { isNumeric } from "../../numericOrLabel";
import { setCharacterSlots } from "../../characterSlots";
import { setBackgroundSlots } from "../../backgroundSlots";
import * as speakerManager from "../../../core/managers/speakerManager";
import * as characterManager from "../../../core/managers/characterManager";
import * as positionManager from "../../../core/managers/positionManager";
import * as backgroundManager from "../../../core/managers/backgroundManager";

// #sprite は「話者指定+表情+位置+表示/非表示+初期位置定義」の統合タグ
// (以前の #c, #pos, #hide を吸収)。頻度が高いので短縮エイリアス #s も使える
// (# s:alice === # sprite:alice)。frequent caseほど短く書けるようにする方針:
//
//   # s:alice                 → 話者をaliceにする(表情/位置は変えない、一番よく使う形)
//   # s:alice:happy           → 話者をaliceにし、表情をhappyにする
//   # s:alice:hide            → aliceを非表示にする
//   # s:alice:pos:30:60       → 座標を直接指定(一時的な移動、既定500msかけて移動)
//   # s:alice:pos:30:60:3000  → 移動時間を指定(3000msかけてゆっくり移動、
//                                歩きアニメ等と組み合わせて「歩いてくる」演出に使う)
//   # s:alice:pos:center      → プリセット位置(ラベル指定)
//   # s:alice:pos:center:2000 → プリセット位置+移動時間指定
//   # s:alice:pos:reset       → 位置をリセット(既定の移動時間)
//   # s:alice:initPos:30:55   → aliceの「既定の立ち位置」自体を定義/上書きする
//                                (characterSlots.json相当をink側からも書ける。
//                                 JS(VNLayer.configure({characterSlots}))と
//                                 同じ共有ストアを使うので、後から書いた方が勝つ。
//                                 これによりcharacterSlots.jsonを注入しなくても
//                                 ink側だけで初期位置を完結できる)
//
// #bgを#s:bgへ統合(2026-08-08): 背景も「静止画を切り替えるだけ」という点で
// #sprite(表情ごとの静止画)と本質は同じ、という判断から、以前独立していた
// #bgタグ(tags/defs/special/bg.ts)を廃止し、「bg」という予約済みの疑似
// キャラ名として#sprite(#s)側に統合した:
//
//   # s:bg:izakaya_main_day               → 背景をizakaya_main_dayに切り替える(旧#bg:name相当)
//   # s:bg:izakaya_main_day:color:#f3e3c8 → 「izakaya_main_day」という背景の
//                                            見た目(色)自体を定義/上書きする
//                                            (backgroundSlots.json相当をink側
//                                            からも書ける。JS側の
//                                            VNLayer.configure({backgroundSlots})
//                                            と同じ共有ストアを使うので、
//                                            後から書いた方が勝つ)。定義すると
//                                            同時にその背景へ切り替えもする
//                                            (旧#bg:name:color:...相当)。
//
// 「bg」は普通のキャラ名としては使えない予約名になる(通常のキャラ名運用と
// 衝突する可能性は低いという判断)。この分岐は話者設定(setSpeaker)や
// 表情/位置ロジックより前に必ずガードするので、# s:bg:... で誤って
// 話者が「bg」になったり、charactersAtomFamilyに「bg」というキャラが
// 紛れ込んだりすることはない。
//
// 注意: このタグの話者抽出(currentSpeakerForLine)自体はcore/inkStepRunner.ts側で
// 行っている(_ref解決も含む)。ここのrun()は「表情/位置/表示状態の反映」だけを担当する。
// core/inkStepRunner.ts側もbg疑似キャラを話者候補から除外し、visual.bgの
// 復元(リロード後のスナップショット)を#s:bg:...から行うよう対応済み。
//
// 実装はcore/managers/{speaker,character,position,background}Managerに委譲。
// basic/special分離での位置づけ: 話者切り替え/hide/表情/pos(座標プリセット
// 解決)/背景切り替えという複数の分岐と複数のマネージャーにまたがるため、
// specialタグとして現状維持(core/useStoryEngine.tsは一切経由しない)。
const BG_PSEUDO_NAME = "bg";

export type SpriteConfig = {
  posPresets: Record<string, { originX: number; originY: number }>;
};

const defaultConfig: SpriteConfig = {
  posPresets: {
    center: { originX: 50, originY: 50 },
  },
};

registerTag<SpriteConfig>({
  key: "sprite",
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const { atomKey, instanceId } = handlers;
    const [name, mode, ...rest] = args;

    if (name === BG_PSEUDO_NAME) {
      // #bg統合分岐。modeがそのまま背景名(#s:bg:<名前>の<名前>)を指す
      // (bgには「話者だけ指定して見た目は変えない」という省略形が無いため)。
      const bgName = mode;
      if (!bgName) return;
      const [colorMode, colorValue] = rest;
      if (colorMode === "color" && colorValue) {
        setBackgroundSlots({ [bgName]: { color: colorValue } });
      }
      backgroundManager.setBackground(atomKey, instanceId, bgName);
      return;
    }

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
