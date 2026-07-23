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
        const [name, mode, a1, a2] = args;
        if (!name || mode === undefined)
            return; // 話者だけの指定(# s:alice)は何もしない
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
            if (coords)
                handlers.setPos(name, coords);
            return;
        }
        // それ以外(hide/pos以外の単語)は表情指定として扱う
        handlers.setChar(name, mode);
    },
});
//# sourceMappingURL=s.js.map