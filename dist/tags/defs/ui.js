import { registerTag, registerAlias } from '../registry';
import { parseOnOff } from '../numericOrLabel';
const defaultConfig = {
    transientDurationMs: 4000,
};
registerTag({
    key: 'ui',
    defaultConfig,
    run: ({ args, handlers, config }) => {
        const [section, key, ...rest] = args;
        const value = rest.join(':');
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
            if (key === 'show') {
                const on = parseOnOff(value);
                if (on !== undefined)
                    handlers.setMessageWindowVisible(on);
                return;
            }
            if (key === 'interactive') {
                const on = parseOnOff(value);
                if (on !== undefined)
                    handlers.setUiConfig({ messageWindow: { interactive: on } });
                return;
            }
            if (key === 'skin')
                return handlers.setUiConfig({ messageWindow: { skin: value } });
            return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
        }
        if (section === 'choice') {
            if (key === 'show') {
                const on = parseOnOff(value);
                if (on !== undefined)
                    handlers.setChoicesVisible(on);
                return;
            }
            if (key === 'interactive') {
                const on = parseOnOff(value);
                if (on !== undefined)
                    handlers.setUiConfig({ choice: { interactive: on } });
                return;
            }
            if (key === 'spacing') {
                const n = Number(value);
                if (Number.isFinite(n))
                    return handlers.setUiConfig({ choice: { spacing: n } });
                return;
            }
            if (key === 'skin')
                return handlers.setUiConfig({ choice: { skin: value } });
            if (key === 'anchor')
                return handlers.setUiConfig({ choice: { anchor: value === 'reset' ? undefined : value } });
            if (key === 'offset') {
                const n = Number(value);
                if (Number.isFinite(n))
                    return handlers.setUiConfig({ choice: { offset: n } });
                return;
            }
            return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
        }
        if (section === 'backlog') {
            if (key === 'clear')
                return handlers.clearLines();
            if (key === 'show') {
                const on = parseOnOff(value);
                if (on !== undefined)
                    handlers.setUiConfig({ backlog: { show: on } });
                return;
            }
            if (key === 'skin')
                return handlers.setUiConfig({ backlog: { skin: value } });
            if (key === 'mode' && (value === 'global' || value === 'perInstance')) {
                return handlers.setUiConfig({ backlog: { mode: value } });
            }
            if (key === 'anchor')
                return handlers.setUiConfig({ backlog: { anchor: value === 'reset' ? undefined : value } });
            if (key === 'offset') {
                const n = Number(value);
                if (Number.isFinite(n))
                    return handlers.setUiConfig({ backlog: { offset: n } });
                return;
            }
            return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
        }
        if (section === 'character') {
            if (key === 'clickable') {
                const on = parseOnOff(value);
                if (on !== undefined)
                    handlers.setUiConfig({ character: { clickable: on } });
                return;
            }
            return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
        }
        if (section === 'font') {
            if (key === 'family')
                return handlers.setUiConfig({ font: { family: value } });
            if (key === 'size') {
                const n = Number(value);
                if (Number.isFinite(n))
                    return handlers.setUiConfig({ font: { sizePx: n } });
                return;
            }
            return handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
        }
        handlers.onUnknownTag?.(['ui', section, key, value].filter(Boolean).join(':'));
    },
});
registerAlias('u', 'ui');
//# sourceMappingURL=ui.js.map