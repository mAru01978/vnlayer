import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const BG_COLORS = {
    izakaya_main_day: '#f3e3c8',
    izakaya_main_evening: '#e6b06a',
    izakaya_main_night: '#2b2440',
    izakaya_main_closed: '#4a4a4a',
};
// キャラの立ち位置(originX/originY、%)から視線ターゲット(gaze.x/gaze.y、%)への
// 向きを角度(度)で返す。ステージが正方形でない場合の縦横比の歪みは無視した
// 簡易計算(モック確認用としては十分)。
function computeGazeAngleDeg(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
}
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
function CharacterSprite({ name, state, slot, isFocused, hasSpeaker, onClick }) {
    const gazeAngle = state.gaze
        ? computeGazeAngleDeg(slot.originX, slot.originY, state.gaze.x, state.gaze.y)
        : null;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { onClick: onClick, style: {
                    position: 'absolute',
                    left: `${slot.originX}%`,
                    top: `${slot.originY}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 80,
                    height: 140,
                    borderRadius: 6,
                    background: '#8a8a8a',
                    opacity: hasSpeaker ? (isFocused ? 1 : 0.35) : 1,
                    transition: `left ${slot.durationMs ?? 500}ms ease, top ${slot.durationMs ?? 500}ms ease, opacity 300ms ease`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    color: '#fff',
                    fontSize: 12,
                    paddingBottom: 4,
                    // 親のステージ全体はoverlayモードでpointerEvents:'none'になっている
                    // ことがあるが、キャラ個別のクリック(#anim等と組み合わせた反応演出)は
                    // overlay/full どちらでも拾えてほしいので、onClickがある時は
                    // 自分自身だけpointerEvents:'auto'に戻す。
                    pointerEvents: onClick ? 'auto' : undefined,
                    cursor: onClick ? 'pointer' : undefined,
                }, children: [_jsx("div", { children: name }), _jsxs("div", { style: { fontSize: 10, opacity: 0.8 }, children: [state.expression, state.motion ? ` / ${state.motion}` : '', state.animLoop ? ' 🔁' : '', state.animReverse ? ' ⏪' : '', state.animSpeed !== undefined && state.animSpeed !== 1 ? ` x${state.animSpeed}` : ''] })] }), gazeAngle !== null && (_jsx("div", { style: {
                    position: 'absolute',
                    left: `${slot.originX}%`,
                    top: `${slot.originY}%`,
                    transform: `translate(-50%, -50%) translateY(-84px) rotate(${gazeAngle}deg)`,
                    width: 0,
                    height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderLeft: '14px solid #ffd54a',
                    transition: `transform 150ms linear, left ${slot.durationMs ?? 500}ms ease, top ${slot.durationMs ?? 500}ms ease`,
                    pointerEvents: 'none',
                    zIndex: 6,
                } }))] }));
}
function MessageBubble({ speaker, content, slot, revealedCount, visible, onClick, fontFamily, fontSizePx }) {
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
        .vnlayer-scroll-hidden {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* 旧Edge/IE */
        }
        .vnlayer-scroll-hidden::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
      ` }), _jsxs("div", { onClick: onClick, className: "vnlayer-scroll-hidden", style: {
                    position: 'absolute',
                    left: `${slot.originX}%`,
                    top: `${Math.max(slot.originY - 26, 4)}%`,
                    transform: 'translate(-50%, -100%)',
                    maxWidth: 220,
                    // 文字数が多い時、吹き出しは上方向(translate(-50%,-100%))に伸び続けるため、
                    // ステージの上端を越えてしまうことがある。maxHeight+overflowYで、
                    // 伸びすぎたら吹き出し内部でスクロールする形にして必ず画面内に収まるようにする
                    // (はみ出し防止自体はfullモードの高さ固定ステージで特に起きやすい)。
                    // スクロールバー自体の見た目は below の <style> で非表示にしている
                    // (機能(はみ出し時にスクロールできること)はそのまま、見た目だけ消す)。
                    maxHeight: '70%',
                    overflowY: 'auto',
                    background: 'rgba(255,255,255,0.95)',
                    color: '#111',
                    borderRadius: 12,
                    padding: '10px 14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    fontSize: fontSizePx ?? 13,
                    fontFamily,
                    lineHeight: 1.5,
                    cursor: revealedCount < content.length ? 'pointer' : 'default',
                    opacity: visible ? 1 : 0,
                    transition: `opacity ${BUBBLE_FADE_MS}ms ease, left ${slot.durationMs ?? 500}ms ease, top ${slot.durationMs ?? 500}ms ease`,
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
                        } })] })] }));
}
function NarratorCaption({ content, revealedCount, visible, onClick, fontFamily, fontSizePx }) {
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
            fontSize: fontSizePx ?? 13,
            fontFamily,
            lineHeight: 1.5,
            textAlign: 'center',
            cursor: revealedCount < content.length ? 'pointer' : 'default',
            opacity: visible ? 1 : 0,
            transition: `opacity ${BUBBLE_FADE_MS}ms ease`,
            zIndex: 5,
        }, children: content.slice(0, revealedCount) }));
}
function ChoiceButton({ text, onClick, disabled, fontFamily, fontSizePx }) {
    return (_jsx("button", { onClick: onClick, disabled: disabled, style: {
            padding: '10px 14px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: disabled ? '#eee' : '#fff',
            color: '#111',
            cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            width: '100%',
            fontSize: fontSizePx,
            fontFamily,
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