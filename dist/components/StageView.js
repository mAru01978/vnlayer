'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
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
    const [bubbles, setBubbles] = useState({});
    const activeSpeakerRef = useRef(null);
    const fadeOutTimersRef = useRef({});
    const typeIntervalRef = useRef(null);
    const activeMessage = story?.activeMessage ?? null;
    useEffect(() => {
        if (activeMessage) {
            const prevSpeaker = activeSpeakerRef.current;
            const newSpeaker = activeMessage.speaker;
            activeSpeakerRef.current = newSpeaker;
            if (prevSpeaker && prevSpeaker !== newSpeaker) {
                if (fadeOutTimersRef.current[prevSpeaker])
                    clearTimeout(fadeOutTimersRef.current[prevSpeaker]);
                setBubbles((prev) => prev[prevSpeaker] ? { ...prev, [prevSpeaker]: { ...prev[prevSpeaker], visible: false } } : prev);
                fadeOutTimersRef.current[prevSpeaker] = setTimeout(() => {
                    setBubbles((prev) => {
                        const next = { ...prev };
                        delete next[prevSpeaker];
                        return next;
                    });
                }, BUBBLE_FADE_MS);
            }
            if (fadeOutTimersRef.current[newSpeaker]) {
                clearTimeout(fadeOutTimersRef.current[newSpeaker]);
                delete fadeOutTimersRef.current[newSpeaker];
            }
            setBubbles((prev) => ({
                ...prev,
                [newSpeaker]: {
                    content: activeMessage.content,
                    revealedCount: 0,
                    visible: false,
                    typeSpeedMs: activeMessage.typeSpeedMs ?? 30,
                    fadeIn: activeMessage.fadeIn,
                },
            }));
            requestAnimationFrame(() => setBubbles((prev) => (prev[newSpeaker] ? { ...prev, [newSpeaker]: { ...prev[newSpeaker], visible: true } } : prev)));
        }
        else {
            const speaker = activeSpeakerRef.current;
            activeSpeakerRef.current = null;
            if (!speaker)
                return;
            if (fadeOutTimersRef.current[speaker])
                clearTimeout(fadeOutTimersRef.current[speaker]);
            setBubbles((prev) => (prev[speaker] ? { ...prev, [speaker]: { ...prev[speaker], visible: false } } : prev));
            fadeOutTimersRef.current[speaker] = setTimeout(() => {
                setBubbles((prev) => {
                    const next = { ...prev };
                    delete next[speaker];
                    return next;
                });
            }, BUBBLE_FADE_MS);
        }
    }, [activeMessage]);
    useEffect(() => {
        if (typeIntervalRef.current) {
            clearInterval(typeIntervalRef.current);
            typeIntervalRef.current = null;
        }
        const speaker = activeMessage?.speaker;
        const text = activeMessage?.content ?? '';
        if (!speaker || !text)
            return;
        const speed = activeMessage?.typeSpeedMs ?? 30;
        if (speed <= 0) {
            setBubbles((prev) => (prev[speaker] ? { ...prev, [speaker]: { ...prev[speaker], revealedCount: text.length } } : prev));
            return;
        }
        typeIntervalRef.current = setInterval(() => {
            setBubbles((prev) => {
                const entry = prev[speaker];
                if (!entry)
                    return prev;
                if (entry.revealedCount >= text.length) {
                    if (typeIntervalRef.current)
                        clearInterval(typeIntervalRef.current);
                    return prev;
                }
                return { ...prev, [speaker]: { ...entry, revealedCount: entry.revealedCount + 1 } };
            });
        }, speed);
        return () => {
            if (typeIntervalRef.current)
                clearInterval(typeIntervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeMessage]);
    const skipTyping = () => {
        if (typeIntervalRef.current) {
            clearInterval(typeIntervalRef.current);
            typeIntervalRef.current = null;
        }
        const speaker = activeMessage?.speaker;
        if (!speaker)
            return;
        setBubbles((prev) => prev[speaker] ? { ...prev, [speaker]: { ...prev[speaker], revealedCount: prev[speaker].content.length } } : prev);
    };
    const outerRef = useRef(null);
    const [autoHeightPx, setAutoHeightPx] = useState(undefined);
    // isProcessingは`story`から取り出す前にこのeffect内で参照したいので、
    // refに都度同期しておく(このeffect自体はhooksの順序を守るため、
    // 下の`if (!story) return null;`より前、つまりstoryがまだnullかもしれない
    // 段階で定義しておく必要がある)。
    const isProcessingForMeasureRef = useRef(false);
    useEffect(() => {
        isProcessingForMeasureRef.current = story?.isProcessing ?? false;
    }, [story?.isProcessing]);
    const stageStickToViewport = story ? getUiConfig(story.instanceId).stage.stickToViewport : true;
    const explicitHeightPx = story ? getUiConfig(story.instanceId).stage.heightPx : undefined;
    // 自分自身の絶対配置ボックスの高さを一旦0にしてから測ることで、
    // 「自分の高さがdocument全体のscrollHeightに混入し、その値を自分の
    // 高さとして採用する」という自己参照ループ(measurementが自分自身に
    // フィードバックして値が肥大化/実際のコンテンツより過大な値で固定
    // されてしまう)を避ける。
    const measureStageHeight = useCallback(() => {
        const el = outerRef.current;
        if (!el || typeof document === 'undefined')
            return;
        const prevHeight = el.style.height;
        el.style.height = '0px';
        void el.offsetHeight; // 強制的にreflowさせ、直後のscrollHeight測定に反映させる
        const measured = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        el.style.height = prevHeight;
        setAutoHeightPx(measured);
    }, []);
    useEffect(() => {
        // #ui:stage:height:<px> の明示指定がある場合、あるいはstickToViewport:on
        // (この機構自体が不要)、またはoverlayモードでない(mode:'full'、そもそも
        // stage.heightPxを使わない)場合は自動計測しない。
        if (mode !== 'overlay' || stageStickToViewport || explicitHeightPx)
            return;
        if (typeof document === 'undefined' || typeof ResizeObserver === 'undefined')
            return;
        measureStageHeight();
        let debounceTimer = null;
        const observer = new ResizeObserver(() => {
            // 実行中(タグ処理・#wait:や移動アニメーション等の最中)は基準の
            // 高さを動かさない。シナリオが選択肢待ち等で落ち着いている
            // タイミングでだけ再計測することで、シーンの途中で足元(座標系)が
            // ガクッと動いてキャラの位置がズレて見える事態を防ぐ。
            if (isProcessingForMeasureRef.current)
                return;
            if (debounceTimer)
                clearTimeout(debounceTimer);
            debounceTimer = setTimeout(measureStageHeight, 150);
        });
        observer.observe(document.body);
        return () => {
            observer.disconnect();
            if (debounceTimer)
                clearTimeout(debounceTimer);
        };
    }, [mode, stageStickToViewport, explicitHeightPx, measureStageHeight]);
    if (!story)
        return null;
    const { lines, choices, bg, characters, speaker, cam, shake, isProcessing, choose, choicesHidden, messageWindowHidden, positionOverrides, instanceId, } = story;
    const visibleChoices = choices.filter((c) => !c.tags?.some((t) => ['tick', 'interrupt'].includes(t.split(':')[0])));
    const camStyle = {
        transform: `scale(${cam.scale})`,
        transformOrigin: `${cam.originX}% ${cam.originY}%`,
        transition: 'transform 500ms ease',
    };
    const isOverlay = mode === 'overlay';
    const anchorSide = uiAnchor === 'left' ? { left: 12 } : { right: 12 };
    const uiConfig = getUiConfig(instanceId);
    const overlayPosition = uiConfig.stage.stickToViewport ? 'fixed' : 'absolute';
    const choiceAnchorName = uiConfig.choice.anchor;
    const choiceAnchorSlot = choiceAnchorName
        ? positionOverrides[choiceAnchorName] ?? getCharacterSlot(choiceAnchorName) ?? null
        : null;
    const backlogAnchorName = uiConfig.backlog.anchor;
    const backlogAnchorSlot = backlogAnchorName
        ? positionOverrides[backlogAnchorName] ?? getCharacterSlot(backlogAnchorName) ?? null
        : null;
    const uiVis = typeof showUi === 'boolean'
        ? { backlogButton: showUi, choices: showUi, messageWindow: showUi }
        : {
            backlogButton: showUi.backlogButton ?? true,
            choices: showUi.choices ?? true,
            messageWindow: showUi.messageWindow ?? true,
        };
    const effectiveHeightPx = uiConfig.stage.heightPx ?? autoHeightPx;
    const outerStyle = isOverlay
        ? {
            position: overlayPosition,
            // 修正メモ: stickToViewport:off時、中身(bg/キャラ/選択肢)は全部
            // position:absoluteの子要素なので、この外枠の高さを明示しないと
            // 画面1枚分(100vh相当)に潰れてしまい、それより外側のoriginY(%)や
            // #web:scrollのスクロール量が「見えない・押せない」領域になってしまう
            // (操作不能バグの正体だった)。#ui:stage:height:<px>の明示指定が
            // あればそれを最優先、無ければ上のuseEffectで自動計測した
            // ページ全体の高さ(autoHeightPx)を使う。どちらも無ければ以前と
            // 同じ挙動(inset:0)にフォールバック。
            ...(uiConfig.stage.stickToViewport || !effectiveHeightPx
                ? { inset: 0 }
                : uiConfig.stage.widthPx
                    ? {
                        // 修正メモ: widthPxも指定された場合、左右をページ幅に伸縮させず
                        // 固定サイズの箱にして中央寄せする。これでcharacterSlots/initPosの
                        // originX(%)は常に同じ絶対座標(px)を指すようになり、この
                        // VNLayerを埋め込むページの横幅が変わっても位置がズレなくなる。
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: `${uiConfig.stage.widthPx}px`,
                        height: `${effectiveHeightPx}px`,
                    }
                    : { top: 0, left: 0, right: 0, height: `${effectiveHeightPx}px` }),
            pointerEvents: 'none',
            zIndex: 50,
            fontFamily: uiConfig.font.family ?? 'sans-serif',
            fontSize: uiConfig.font.sizePx,
        }
        : {
            maxWidth: 640,
            margin: '0 auto',
            fontFamily: uiConfig.font.family ?? 'sans-serif',
            fontSize: uiConfig.font.sizePx,
        };
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
    return (_jsxs("div", { ref: outerRef, style: outerStyle, children: [_jsx("style", { children: `
        @keyframes izakaya-shake-${shake.nonce} {
          0% { transform: translateX(0); }
          25% { transform: translateX(-${shake.amplitude}px); }
          50% { transform: translateX(${shake.amplitude}px); }
          75% { transform: translateX(-${shake.amplitude}px); }
          100% { transform: translateX(0); }
        }
      ` }, shake.nonce), _jsx("style", { children: `
        .vnlayer-scroll-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .vnlayer-scroll-hidden::-webkit-scrollbar {
          display: none;
        }
      ` }), uiVis.backlogButton && uiConfig.backlog.show && (_jsx("div", { style: backlogAnchorSlot
                    ? {
                        position: 'absolute',
                        left: `${backlogAnchorSlot.originX}%`,
                        top: `calc(${backlogAnchorSlot.originY}% + ${uiConfig.backlog.offset ?? 20}px)`,
                        transform: 'translateX(-50%)',
                        pointerEvents: 'auto',
                        zIndex: 51,
                    }
                    : isOverlay
                        ? { position: overlayPosition, ...anchorSide, bottom: uiConfig.backlog.offset ?? 12, pointerEvents: 'auto', zIndex: 51 }
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
                                return (_jsx(renderer.CharacterSprite, { name: name, state: state, slot: slot, isFocused: isFocused, hasSpeaker: !!speaker, onClick: uiConfig.character.clickable ? () => story.notify('char_click', name) : undefined }, name));
                            }), story.flash && _jsx(renderer.FlashOverlay, { color: story.flash.color, durationMs: story.flash.durationMs })] }), uiVis.messageWindow &&
                        !messageWindowHidden &&
                        Object.entries(bubbles)
                            .filter(([name]) => name !== 'narrator')
                            .map(([name, entry]) => {
                            const slot = positionOverrides[name] ?? getCharacterSlot(name) ?? { originX: 50, originY: 40 };
                            return (_jsx("div", { style: isOverlay ? { pointerEvents: 'auto' } : undefined, children: _jsx(renderer.MessageBubble, { speaker: name, content: entry.content, slot: slot, revealedCount: entry.revealedCount, visible: entry.visible, onClick: uiConfig.messageWindow.interactive ? skipTyping : undefined, fontFamily: uiConfig.font.family, fontSizePx: uiConfig.font.sizePx, offsetPx: uiConfig.messageWindow.offset }) }, name));
                        }), uiVis.messageWindow && !messageWindowHidden && bubbles.narrator && (_jsx("div", { style: isOverlay ? { pointerEvents: 'auto' } : undefined, children: _jsx(renderer.NarratorCaption, { content: bubbles.narrator.content, revealedCount: bubbles.narrator.revealedCount, visible: bubbles.narrator.visible, onClick: uiConfig.messageWindow.interactive ? skipTyping : undefined, fontFamily: uiConfig.font.family, fontSizePx: uiConfig.font.sizePx }) }))] }), uiVis.backlogButton && uiConfig.backlog.show && backlogOpen && (_jsxs("div", { className: "vnlayer-scroll-hidden", style: backlogAnchorSlot
                    ? {
                        position: 'absolute',
                        left: `${backlogAnchorSlot.originX}%`,
                        top: `calc(${backlogAnchorSlot.originY}% + ${(uiConfig.backlog.offset ?? 20) + 36}px)`,
                        transform: 'translateX(-50%)',
                        width: 280,
                        maxHeight: `calc(100% - ${backlogAnchorSlot.originY}% - ${(uiConfig.backlog.offset ?? 20) + 36}px - 8px)`,
                        overflowY: 'auto',
                        pointerEvents: 'auto',
                        padding: '12px 16px',
                        background: '#1e1e1e',
                        color: '#fff',
                        borderRadius: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        zIndex: 51,
                    }
                    : {
                        position: isOverlay ? overlayPosition : 'static',
                        ...(isOverlay ? anchorSide : {}),
                        bottom: isOverlay ? (uiConfig.backlog.offset ?? 12) + 44 : undefined,
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
                    }, children: [lines.length === 0 && _jsx("div", { style: { opacity: 0.5, fontSize: 12 }, children: "\u307E\u3060\u4F1A\u8A71\u304C\u3042\u308A\u307E\u305B\u3093" }), lines.map((line, i) => line.kind === 'choice' ? (_jsxs("div", { children: [_jsx("div", { style: { fontSize: 13, opacity: 0.7, marginBottom: 2 }, children: "[Choice]" }), _jsxs("div", { style: { whiteSpace: 'pre-wrap', lineHeight: 1.6 }, children: [line.number, ". ", line.text] })] }, i)) : (_jsxs("div", { children: [line.speaker && (_jsxs("div", { style: { fontSize: 13, opacity: 0.7, marginBottom: 2 }, children: ["[", line.speaker, "]"] })), _jsx("div", { style: { whiteSpace: 'pre-wrap', lineHeight: 1.6 }, children: line.content })] }, i)))] })), uiVis.choices && !choicesHidden && visibleChoices.length > 0 && (_jsx("div", { className: "vnlayer-scroll-hidden", style: choiceAnchorSlot
                    ? {
                        position: 'absolute',
                        left: `${choiceAnchorSlot.originX}%`,
                        top: `calc(${choiceAnchorSlot.originY}% + ${uiConfig.choice.offset ?? 20}px)`,
                        transform: 'translateX(-50%)',
                        width: isOverlay ? 220 : 200,
                        maxHeight: `calc(100% - ${choiceAnchorSlot.originY}% - ${uiConfig.choice.offset ?? 20}px - 8px)`,
                        overflowY: 'auto',
                        pointerEvents: 'auto',
                        zIndex: 51,
                    }
                    : {
                        position: isOverlay ? overlayPosition : 'static',
                        ...(isOverlay ? anchorSide : {}),
                        bottom: isOverlay ? uiConfig.choice.offset ?? 130 : undefined,
                        width: isOverlay ? 280 : undefined,
                        maxHeight: isOverlay ? '60vh' : 220,
                        overflowY: 'auto',
                        pointerEvents: 'auto',
                        marginTop: isOverlay ? 0 : 10,
                        zIndex: 51,
                    }, children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: uiConfig.choice.spacing ?? 8 }, children: visibleChoices.map((c) => (_jsx(renderer.ChoiceButton, { text: c.text, onClick: () => choose(c.index), disabled: isProcessing || !uiConfig.choice.interactive, fontFamily: uiConfig.font.family, fontSizePx: uiConfig.font.sizePx }, c.index))) }) }))] }));
}
//# sourceMappingURL=StageView.js.map