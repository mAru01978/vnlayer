import { registerTag } from '../registry';
import { isNumeric } from '../numericOrLabel';
const defaultConfig = {
    posPresets: {
        center: { originX: 50, originY: 50 },
    },
};
registerTag({
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
        if (name)
            handlers.setSpeaker(name);
        if (!name || mode === undefined)
            return; // 話者だけの指定(# s:alice)は何もしない
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
//# sourceMappingURL=s.js.map