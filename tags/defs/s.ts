import { registerTag } from '../registry';
import { isNumeric } from '../numericOrLabel';

// #s は「話者指定」から「話者+表情+位置+表示/非表示」の統合タグに拡張した
// (以前の #c, #pos, #hide を吸収)。frequent caseほど短く書けるようにする方針:
//
//   # s:alice                 → 話者をaliceにする(表情/位置は変えない、一番よく使う形)
//   # s:alice:happy           → 話者をaliceにし、表情をhappyにする(旧#s+#cの組み合わせ)
//   # s:alice:hide            → aliceを非表示にする(旧#hide)
//   # s:alice:pos:30:60       → 座標を直接指定(旧#pos、移動アニメは既定の500ms)
//   # s:alice:pos:30:60:3000  → 移動時間を指定(3000ms かけてゆっくり移動、
//                                歩きアニメ等と組み合わせて「歩いてくる」演出に使う)
//   # s:alice:pos:center      → プリセット位置(旧#pos、ラベル指定)
//   # s:alice:pos:center:2000 → プリセット位置+移動時間指定
//   # s:alice:pos:reset       → 位置をリセット(旧#pos:reset、既定の移動時間)
//
// 話者だけを変えたい(表情等はそのまま)場合、args[1]を省略すればよい。
//
// 注意: このタグの話者抽出(currentSpeakerForLine)自体はcore/inkStepRunner.ts側で
// 行っている(_ref解決も含む)。ここのrun()は「表情/位置/表示状態の反映」だけを担当する。
export type SConfig = { posPresets: Record<string, { originX: number; originY: number }> };

const defaultConfig: SConfig = {
  posPresets: {
    center: { originX: 50, originY: 50 },
  },
};

registerTag<SConfig>({
  key: 's',
  defaultConfig,
  run: ({ args, handlers, config }) => {
    const [name, mode, ...rest] = args;
    // 重要: ここで即座にsetSpeakerを呼ぶ。以前はcore/inkStepRunner.tsが
    // 「テキストを伴う行でだけ」話者state(speaker)を更新していたため、
    // # s:mika:happy のようにタグだけで文章を伴わない行では、その場では
    // 画面上のspeaker stateがまだ古い話者(直前に喋っていた別キャラ)のまま
    // だった。CharacterSpriteの薄い表示(0.35)は「focusされてない=speaker
    // と名前が一致しない」時に発生する演出なので、新しく登場したキャラが
    // 一瞬(前のキャラの#wait:中などに)薄い状態のまま表示されるバグになっていた。
    // ここで#sタグが来た時点で即座にsetSpeakerしておけば、そのズレが起きない。
    if (name) handlers.setSpeaker(name);
    if (!name || mode === undefined) return; // 話者だけの指定(# s:alice)は何もしない

    if (mode === 'hide') {
      handlers.hideChar(name);
      return;
    }

    if (mode === 'pos') {
      const [p1, p2, p3] = rest;

      if (p1 === 'reset') {
        handlers.setPos(name, 'reset');
        return;
      }

      if (isNumeric(p1) && isNumeric(p2)) {
        // pos:x:y か pos:x:y:durationMs か
        const durationMs = isNumeric(p3) ? Number(p3) : undefined;
        handlers.setPos(name, { originX: Number(p1), originY: Number(p2) }, durationMs);
        return;
      }

      // pos:プリセット名 か pos:プリセット名:durationMs か
      const coords = config.posPresets[p1];
      if (coords) {
        const durationMs = isNumeric(p2) ? Number(p2) : undefined;
        handlers.setPos(name, coords, durationMs);
      }
      return;
    }

    // それ以外(hide/pos以外の単語)は表情指定として扱う
    handlers.setChar(name, mode);
  },
});
