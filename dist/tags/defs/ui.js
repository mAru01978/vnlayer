import { registerTag, registerAlias } from '../registry';
import { setUiConfig } from '../uiConfig';
const defaultConfig = {
    transientDurationMs: 4000,
};
registerTag({
    key: 'ui',
    defaultConfig,
    run: ({ args, handlers, config }) => {
        const [section, key, value] = args;
        if (section === 'messageWindow') {
            if (key === 'mode') {
                if (value === 'hide')
                    return handlers.setMessageMode('hide');
                if (value === 'transient')
                    return handlers.setMessageMode('transient', config.transientDurationMs);
                return handlers.setMessageMode('persist');
            }
            if (key === 'fade')
                return handlers.setNextRevealFade(value === 'in');
            if (key === 'visible')
                return handlers.setMessageWindowVisible(value !== 'false');
            if (key === 'skin')
                return setUiConfig({ messageWindow: { skin: value } });
            return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
        }
        if (section === 'choice') {
            if (key === 'visible')
                return handlers.setChoicesVisible(value !== 'false');
            if (key === 'spacing') {
                const n = Number(value);
                if (Number.isFinite(n))
                    return setUiConfig({ choice: { spacing: n } });
                return;
            }
            if (key === 'skin')
                return setUiConfig({ choice: { skin: value } });
            return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
        }
        if (section === 'backlog') {
            if (key === 'clear')
                return handlers.clearLines();
            if (key === 'skin')
                return setUiConfig({ backlog: { skin: value } });
            if (key === 'mode' && (value === 'global' || value === 'perInstance')) {
                return setUiConfig({ backlog: { mode: value } });
            }
            return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
        }
        handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
    },
});
registerAlias('u', 'ui');
//# sourceMappingURL=ui.js.map