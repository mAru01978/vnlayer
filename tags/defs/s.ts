import { registerTag } from '../registry';
import { isNumeric } from '../numericOrLabel';

// #s は「話者指定」から「話者+表情+位置+表示/非表示」の統合タグに拡張した
// (以前の #c, #pos, #hide を吸収)。frequent caseほど短く書けるようにする方針:
//
//   # s:alice            → 話者をaliceにする(表情/位置は変えない、一番よく使う形)
//   # s:alice:happy      → 話者をaliceにし、表情をhappyにする(旧#s+#cの組み合わせ)
//   # s:alice:hide       → aliceを非表示にする(旧#hide)
//   # s:alice:pos:30:60  → 座標を直接指定(旧#pos)
//   # s:alice:pos:center → プリセット位置(旧#pos、ラベル指定)
//   # s:alice:pos:reset  → 位置をリセット(旧#pos:reset)
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
    const [name, mode, a1, a2] = args;
    if (!name || mode === undefined) return; // 話者だけの指定(# s:alice)は何もしない

    if (mode === 'hide') {
      handlers.hideChar(name);
      return;
    }

    if (mode === 'pos') {
      if (a1 === 'reset') {
        handlers.setPos(name, 'reset');
        return;
      }
      if (isNumeric(a1) && isNumeric(a2)) {
        handlers.setPos(name, { originX: Number(a1), originY: Number(a2) });
        return;
      }
      const coords = config.posPresets[a1];
      if (coords) handlers.setPos(name, coords);
      return;
    }

    // それ以外(hide/pos以外の単語)は表情指定として扱う
    handlers.setChar(name, mode);
  },
});
