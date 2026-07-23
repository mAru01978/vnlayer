'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useStory } from '../context/StoryContext';
import { getCharacterSlot } from '../tags/characterSlots';
import { getUiConfig } from '../tags/uiConfig';
import { mockRenderer } from './mockRenderer';
// フェーズ1での整理点: 従来のStage.tsxとVNLayer.tsx(VNLayerInner)は
// 「mode(full/overlay)によって外枠のCSSが違うだけ」で描画ロジック自体はほぼ完全に
// 重複していた。ここに1本化し、Stage.tsx/VNLayerOverlay.tsxはどちらもこの
// StageViewを呼ぶだけの薄いラッパーにする。
const renderer = mockRenderer;
const BUBBLE_FADE_MS = 800;
export default function StageView({ mode = 'full', uiAnchor = 'right', showUi = true, }) {
    const story = useStory();
    const [backlogOpen, setBacklogOpen] = useState(false);
    const [displayedMessage, setDisplayedMessage] = useState(null);
    const [bubbleShown, setBubbleShown] = useState(false);
    const fadeOutTimerRef = useRef(null);
    const activeMessage = story?.activeMessage ?? null;
    const [revealedCount, setRevealedCount] = useState(0);
    const typeIntervalRef = useRef(null);
    useEffect(() => {
        if (typeIntervalRef.current) {
            clearInterval(typeIntervalRef.current);
            typeIntervalRef.current = null;
        }
        const text = displayedMessage?.content ?? '';
        if (!text) {
            setRevealedCount(0);
            return;
        }
        const speedForThisMessage = displayedMessage?.typeSpeedMs ?? 30;
        if (speedForThisMessage <= 0) {
            setRevealedCount(text.length);
            return;
        }
        setRevealedCount(0);
        typeIntervalRef.current = setInterval(() => {
            setRevealedCount((prev) => {
                if (prev >= text.length) {
                    if (typeIntervalRef.current)
                        clearInterval(typeIntervalRef.current);
                    return prev;
                }
                return prev + 1;
            });
        }, speedForThisMessage);
        return () => {
            if (typeIntervalRef.current)
                clearInterval(typeIntervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayedMessage]);
    const skipTyping = () => {
        if (typeIntervalRef.current) {
            clearInterval(typeIntervalRef.current);
            typeIntervalRef.current = null;
        }
        setRevealedCount(displayedMessage?.content.length ?? 0);
    };
    useEffect(() => {
        if (fadeOutTimerRef.current) {
            clearTimeout(fadeOutTimerRef.current);
            fadeOutTimerRef.current = null;
        }
        if (activeMessage) {
            setDisplayedMessage(activeMessage);
            setBubbleShown(false);
            requestAnimationFrame(() => setBubbleShown(true));
        }
        else {
            setBubbleShown(false);
            fadeOutTimerRef.current = setTimeout(() => setDisplayedMessage(null), BUBBLE_FADE_MS);
        }
        return () => {
            if (fadeOutTimerRef.current)
                clearTimeout(fadeOutTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeMessage]);
    if (!story)
        return null;
    const { lines, choices, bg, characters, speaker, cam, shake, userLine, isProcessing, choose, choicesHidden, messageWindowHidden, positionOverrides, } = story;
    const visibleChoices = choices.filter((c) => !c.tags?.some((t) => t.split(':')[0] === 'tick'));
    const camStyle = {
        transform: `scale(${cam.scale})`,
        transformOrigin: `${cam.originX}% ${cam.originY}%`,
        transition: 'transform 500ms ease',
    };
    const isNarratorMessage = displayedMessage?.speaker === 'narrator';
    const bubbleSlot = displayedMessage && !isNarratorMessage
        ? positionOverrides[displayedMessage.speaker] ?? getCharacterSlot(displayedMessage.speaker) ?? { originX: 50, originY: 40 }
        : null;
    const isOverlay = mode === 'overlay';
    const anchorSide = uiAnchor === 'left' ? { left: 12 } : { right: 12 };
    const uiVis = typeof showUi === 'boolean'
        ? { backlogButton: showUi, choices: showUi, messageWindow: showUi, userLine: showUi }
        : {
            backlogButton: showUi.backlogButton ?? true,
            choices: showUi.choices ?? true,
            messageWindow: showUi.messageWindow ?? true,
            userLine: showUi.userLine ?? true,
        };
    const outerStyle = isOverlay
        ? { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, fontFamily: 'sans-serif' }
        : { maxWidth: 640, margin: '0 auto', fontFamily: 'sans-serif' };
    const shakeAnimation = shake.nonce > 0 ? `izakaya-shake-${shake.nonce} ${shake.duration}ms ease` : undefined;
    const stageStyle = isOverlay
        ? { position: 'absolute', inset: 0, animation: shakeAnimation }
        : {
            position: 'relative',
            height: 360,
            overflow: 'hidden',
            borderRadius: 8,
            animation: shakeAnimation,
        };
    return (_jsxs("div", { style: outerStyle, children: [_jsx("style", { children: `
        @keyframes izakaya-shake-${shake.nonce} {
          0% { transform: translateX(0); }
          25% { transform: translateX(-${shake.amplitude}px); }
          50% { transform: translateX(${shake.amplitude}px); }
          75% { transform: translateX(-${shake.amplitude}px); }
          100% { transform: translateX(0); }
        }
      ` }, shake.nonce), uiVis.backlogButton && (_jsx("div", { style: isOverlay
                    ? { position: 'fixed', ...anchorSide, bottom: 12, pointerEvents: 'auto', zIndex: 51 }
                    : { display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 6 }, children: _jsx("button", { onClick: () => setBacklogOpen((v) => !v), style: {
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #999',
                        background: '#fff',
                        color: '#111',
                        fontSize: 12,
                        cursor: 'pointer',
                    }, children: backlogOpen ? 'バックログを閉じる' : 'バックログ' }) })), _jsxs("div", { style: stageStyle, children: [!isOverlay && _jsx(renderer.Background, { bg: bg }), _jsxs("div", { style: { position: 'absolute', inset: 0, ...camStyle, pointerEvents: isOverlay ? 'none' : undefined }, children: [Object.entries(characters).map(([name, state]) => {
                                const slot = positionOverrides[name] ?? getCharacterSlot(name) ?? { originX: 50, originY: 60 };
                                const isFocused = speaker === name;
                                return (_jsx(renderer.CharacterSprite, { name: name, state: state, slot: slot, isFocused: isFocused, hasSpeaker: !!speaker, onClick: () => story.notify('char_click', name) }, name));
                            }), story.flash && _jsx(renderer.FlashOverlay, { color: story.flash.color, durationMs: story.flash.durationMs })] }), uiVis.messageWindow && !messageWindowHidden && displayedMessage && !isNarratorMessage && bubbleSlot && (_jsx("div", { style: isOverlay ? { pointerEvents: 'auto' } : undefined, children: _jsx(renderer.MessageBubble, { speaker: displayedMessage.speaker, content: displayedMessage.content, slot: bubbleSlot, revealedCount: revealedCount, visible: bubbleShown, onClick: skipTyping }) })), displayedMessage && isNarratorMessage && (_jsx("div", { style: isOverlay ? { pointerEvents: 'auto' } : undefined, children: _jsx(renderer.NarratorCaption, { content: displayedMessage.content, revealedCount: revealedCount, visible: bubbleShown, onClick: skipTyping }) }))] }), uiVis.backlogButton && backlogOpen && (_jsxs("div", { style: {
                    position: isOverlay ? 'fixed' : 'static',
                    ...(isOverlay ? anchorSide : {}),
                    bottom: isOverlay ? 56 : undefined,
                    width: isOverlay ? 320 : undefined,
                    pointerEvents: 'auto',
                    marginTop: isOverlay ? 0 : 12,
                    padding: '12px 16px',
                    background: '#1e1e1e',
                    color: '#fff',
                    borderRadius: 8,
                    maxHeight: 240,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    zIndex: 51,
                }, children: [lines.length === 0 && _jsx("div", { style: { opacity: 0.5, fontSize: 12 }, children: "\u307E\u3060\u4F1A\u8A71\u304C\u3042\u308A\u307E\u305B\u3093" }), lines.map((line, i) => (_jsxs("div", { children: [line.speaker && _jsx("div", { style: { fontSize: 13, opacity: 0.7, marginBottom: 2 }, children: line.speaker }), _jsx("div", { style: { whiteSpace: 'pre-wrap', lineHeight: 1.6 }, children: line.content })] }, i)))] })), uiVis.userLine && userLine && (_jsxs("div", { style: {
                    position: isOverlay ? 'fixed' : 'static',
                    ...(isOverlay ? anchorSide : {}),
                    bottom: isOverlay ? 100 : undefined,
                    pointerEvents: 'auto',
                    marginTop: isOverlay ? 0 : 8,
                    padding: '8px 14px',
                    background: '#3a5a8c',
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 14,
                    zIndex: 51,
                }, children: ["\u3042\u306A\u305F: ", userLine] })), uiVis.choices && !choicesHidden && visibleChoices.length > 0 && (_jsx("div", { style: {
                    position: isOverlay ? 'fixed' : 'static',
                    ...(isOverlay ? anchorSide : {}),
                    bottom: isOverlay ? 130 : undefined,
                    width: isOverlay ? 280 : undefined,
                    pointerEvents: 'auto',
                    marginTop: isOverlay ? 0 : 10,
                    zIndex: 51,
                }, children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: getUiConfig().choice.spacing ?? 8 }, children: visibleChoices.map((c) => (_jsx(renderer.ChoiceButton, { text: c.text, onClick: () => choose(c.index), disabled: isProcessing }, c.index))) }) }))] }));
}
//# sourceMappingURL=StageView.js.map