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