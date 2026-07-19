import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const BG_COLORS = {
    izakaya_main_day: '#f3e3c8',
    izakaya_main_evening: '#e6b06a',
    izakaya_main_night: '#2b2440',
    izakaya_main_closed: '#4a4a4a',
};
function resolveBgColor(bg) {
    const key = bg.replace(':', '_');
    return BG_COLORS[`izakaya_main_${bg.split(':')[1] ?? bg}`] ?? BG_COLORS[key] ?? '#333';
}
const BUBBLE_FADE_MS = 800;
function Background({ bg }) {
    return (_jsx("div", { style: {
            position: 'absolute',
            inset: 0,
            background: resolveBgColor(bg),
        } }));
}
function CharacterSprite({ name, state, slot, isFocused, hasSpeaker }) {
    return (_jsxs("div", { style: {
            position: 'absolute',
            left: `${slot.originX}%`,
            top: `${slot.originY}%`,
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 140,
            borderRadius: 6,
            background: '#8a8a8a',
            opacity: hasSpeaker ? (isFocused ? 1 : 0.35) : 1,
            transition: 'left 500ms ease, top 500ms ease, opacity 300ms ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            color: '#fff',
            fontSize: 12,
            paddingBottom: 4,
        }, children: [_jsx("div", { children: name }), _jsxs("div", { style: { fontSize: 10, opacity: 0.8 }, children: [state.expression, state.motion ? ` / ${state.motion}` : '', state.animLoop ? ' 🔁' : '', state.animReverse ? ' ⏪' : '', state.animSpeed !== undefined && state.animSpeed !== 1 ? ` x${state.animSpeed}` : ''] })] }));
}
function MessageBubble({ speaker, content, slot, revealedCount, visible, onClick }) {
    return (_jsxs("div", { onClick: onClick, style: {
            position: 'absolute',
            left: `${slot.originX}%`,
            top: `${Math.max(slot.originY - 26, 4)}%`,
            transform: 'translate(-50%, -100%)',
            maxWidth: 220,
            background: 'rgba(255,255,255,0.95)',
            color: '#111',
            borderRadius: 12,
            padding: '10px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            fontSize: 13,
            lineHeight: 1.5,
            cursor: revealedCount < content.length ? 'pointer' : 'default',
            opacity: visible ? 1 : 0,
            transition: `opacity ${BUBBLE_FADE_MS}ms ease, left 500ms ease, top 500ms ease`,
            zIndex: 5,
        }, children: [speaker && _jsx("div", { style: { fontSize: 11, opacity: 0.6, marginBottom: 2 }, children: speaker }), _jsx("div", { style: { whiteSpace: 'pre-wrap' }, children: content.slice(0, revealedCount) }), _jsx("div", { style: {
                    position: 'absolute',
                    left: '50%',
                    bottom: -8,
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '8px solid rgba(255,255,255,0.95)',
                } })] }));
}
function NarratorCaption({ content, revealedCount, visible, onClick }) {
    return (_jsx("div", { onClick: onClick, style: {
            position: 'absolute',
            left: '50%',
            top: 14,
            transform: 'translateX(-50%)',
            maxWidth: 280,
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            lineHeight: 1.5,
            textAlign: 'center',
            cursor: revealedCount < content.length ? 'pointer' : 'default',
            opacity: visible ? 1 : 0,
            transition: `opacity ${BUBBLE_FADE_MS}ms ease`,
            zIndex: 5,
        }, children: content.slice(0, revealedCount) }));
}
function ChoiceButton({ text, onClick, disabled }) {
    return (_jsx("button", { onClick: onClick, disabled: disabled, style: {
            padding: '10px 14px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: disabled ? '#eee' : '#fff',
            color: '#111',
            cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            width: '100%',
        }, children: text }));
}
function FlashOverlay({ color, durationMs }) {
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
        @keyframes izakaya-mock-flash-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      ` }), _jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: color,
                    pointerEvents: 'none',
                    zIndex: 10,
                    animation: `izakaya-mock-flash-fade-out ${durationMs}ms ease-out forwards`,
                } })] }));
}
export const mockRenderer = {
    Background,
    CharacterSprite,
    MessageBubble,
    NarratorCaption,
    ChoiceButton,
    FlashOverlay,
};
//# sourceMappingURL=mockRenderer.js.map