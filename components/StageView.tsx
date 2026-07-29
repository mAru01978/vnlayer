'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
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

export type StageMode = 'full' | 'overlay';
export type UiAnchor = 'left' | 'right';

export type UiVisibility = {
  backlogButton?: boolean;
  choices?: boolean;
  messageWindow?: boolean;
};

export default function StageView({
  mode = 'full',
  uiAnchor = 'right',
  showUi = true,
}: {
  mode?: StageMode;
  uiAnchor?: UiAnchor;
  showUi?: boolean | UiVisibility;
}) {
  const story = useStory();
  const [backlogOpen, setBacklogOpen] = useState(false);

  type BubbleEntry = { content: string; revealedCount: number; visible: boolean; typeSpeedMs: number; fadeIn?: boolean };
  const [bubbles, setBubbles] = useState<Record<string, BubbleEntry>>({});
  const activeSpeakerRef = useRef<string | null>(null);
  const fadeOutTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeMessage = story?.activeMessage ?? null;

  useEffect(() => {
    if (activeMessage) {
      const prevSpeaker = activeSpeakerRef.current;
      const newSpeaker = activeMessage.speaker;
      activeSpeakerRef.current = newSpeaker;

      if (prevSpeaker && prevSpeaker !== newSpeaker) {
        if (fadeOutTimersRef.current[prevSpeaker]) clearTimeout(fadeOutTimersRef.current[prevSpeaker]);
        setBubbles((prev) =>
          prev[prevSpeaker] ? { ...prev, [prevSpeaker]: { ...prev[prevSpeaker], visible: false } } : prev
        );
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
      requestAnimationFrame(() =>
        setBubbles((prev) => (prev[newSpeaker] ? { ...prev, [newSpeaker]: { ...prev[newSpeaker], visible: true } } : prev))
      );
    } else {
      const speaker = activeSpeakerRef.current;
      activeSpeakerRef.current = null;
      if (!speaker) return;
      if (fadeOutTimersRef.current[speaker]) clearTimeout(fadeOutTimersRef.current[speaker]);
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
    if (!speaker || !text) return;

    const speed = activeMessage?.typeSpeedMs ?? 30;
    if (speed <= 0) {
      setBubbles((prev) => (prev[speaker] ? { ...prev, [speaker]: { ...prev[speaker], revealedCount: text.length } } : prev));
      return;
    }

    typeIntervalRef.current = setInterval(() => {
      setBubbles((prev) => {
        const entry = prev[speaker];
        if (!entry) return prev;
        if (entry.revealedCount >= text.length) {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          return prev;
        }
        return { ...prev, [speaker]: { ...entry, revealedCount: entry.revealedCount + 1 } };
      });
    }, speed);

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMessage]);

  const skipTyping = () => {
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
    const speaker = activeMessage?.speaker;
    if (!speaker) return;
    setBubbles((prev) =>
      prev[speaker] ? { ...prev, [speaker]: { ...prev[speaker], revealedCount: prev[speaker].content.length } } : prev
    );
  };

  const outerRef = useRef<HTMLDivElement>(null);
  const [autoHeightPx, setAutoHeightPx] = useState<number | undefined>(undefined);
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
    if (!el || typeof document === 'undefined') return;
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
    if (mode !== 'overlay' || stageStickToViewport || explicitHeightPx) return;
    if (typeof document === 'undefined' || typeof ResizeObserver === 'undefined') return;

    measureStageHeight();

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new ResizeObserver(() => {
      // 実行中(タグ処理・#wait:や移動アニメーション等の最中)は基準の
      // 高さを動かさない。シナリオが選択肢待ち等で落ち着いている
      // タイミングでだけ再計測することで、シーンの途中で足元(座標系)が
      // ガクッと動いてキャラの位置がズレて見える事態を防ぐ。
      if (isProcessingForMeasureRef.current) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(measureStageHeight, 150);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [mode, stageStickToViewport, explicitHeightPx, measureStageHeight]);

  if (!story) return null;

  const {
    lines,
    choices,
    bg,
    characters,
    speaker,
    cam,
    shake,
    isProcessing,
    choose,
    choicesHidden,
    messageWindowHidden,
    positionOverrides,
    instanceId,
  } = story;

  const visibleChoices = choices.filter(
    (c: any) => !c.tags?.some((t: string) => ['tick', 'interrupt'].includes(t.split(':')[0]))
  );

  const camStyle: CSSProperties = {
    transform: `scale(${cam.scale})`,
    transformOrigin: `${cam.originX}% ${cam.originY}%`,
    transition: 'transform 500ms ease',
  };

  const isOverlay = mode === 'overlay';
  const anchorSide: CSSProperties = uiAnchor === 'left' ? { left: 12 } : { right: 12 };

  const uiConfig = getUiConfig(instanceId);
  const overlayPosition: 'fixed' | 'absolute' = uiConfig.stage.stickToViewport ? 'fixed' : 'absolute';
  const choiceAnchorName = uiConfig.choice.anchor;
  const choiceAnchorSlot = choiceAnchorName
    ? positionOverrides[choiceAnchorName] ?? getCharacterSlot(choiceAnchorName) ?? null
    : null;

  const backlogAnchorName = uiConfig.backlog.anchor;
  const backlogAnchorSlot = backlogAnchorName
    ? positionOverrides[backlogAnchorName] ?? getCharacterSlot(backlogAnchorName) ?? null
    : null;

  const uiVis: Required<UiVisibility> =
    typeof showUi === 'boolean'
      ? { backlogButton: showUi, choices: showUi, messageWindow: showUi }
      : {
          backlogButton: showUi.backlogButton ?? true,
          choices: showUi.choices ?? true,
          messageWindow: showUi.messageWindow ?? true,
        };

  const effectiveHeightPx = uiConfig.stage.heightPx ?? autoHeightPx;

  const outerStyle: CSSProperties = isOverlay
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

  const stageStyle: CSSProperties = isOverlay
    ? { position: 'absolute', inset: 0, animation: shakeAnimation }
    : {
        position: 'relative',
        height: 360,
        overflow: 'hidden',
        borderRadius: 8,
        animation: shakeAnimation,
      };

  return (
    <div ref={outerRef} style={outerStyle}>
      <style key={shake.nonce}>{`
        @keyframes izakaya-shake-${shake.nonce} {
          0% { transform: translateX(0); }
          25% { transform: translateX(-${shake.amplitude}px); }
          50% { transform: translateX(${shake.amplitude}px); }
          75% { transform: translateX(-${shake.amplitude}px); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <style>{`
        .vnlayer-scroll-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .vnlayer-scroll-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {uiVis.backlogButton && uiConfig.backlog.show && (
        <div
          style={
            backlogAnchorSlot
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
              : { display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 6 }
          }
        >
          <button
            onClick={() => setBacklogOpen((v) => !v)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #999',
              background: '#fff',
              color: '#111',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {backlogOpen ? 'バックログを閉じる' : 'バックログ'}
          </button>
        </div>
      )}

      <div style={stageStyle}>
        {!isOverlay && <renderer.Background bg={bg} />}

        <div style={{ position: 'absolute', inset: 0, ...camStyle, pointerEvents: isOverlay ? 'none' : undefined }}>
          {Object.entries(characters).map(([name, state]: any) => {
            const slot = positionOverrides[name] ?? getCharacterSlot(name) ?? { originX: 50, originY: 60 };
            const isFocused = speaker === name;
            return (
              <renderer.CharacterSprite
                key={name}
                name={name}
                state={state}
                slot={slot}
                isFocused={isFocused}
                hasSpeaker={!!speaker}
                onClick={uiConfig.character.clickable ? () => story.notify('char_click', name) : undefined}
              />
            );
          })}

          {story.flash && <renderer.FlashOverlay color={story.flash.color} durationMs={story.flash.durationMs} />}
        </div>

        {uiVis.messageWindow &&
          !messageWindowHidden &&
          Object.entries(bubbles)
            .filter(([name]) => name !== 'narrator')
            .map(([name, entry]) => {
              const slot = positionOverrides[name] ?? getCharacterSlot(name) ?? { originX: 50, originY: 40 };
              return (
                <div key={name} style={isOverlay ? { pointerEvents: 'auto' } : undefined}>
                  <renderer.MessageBubble
                    speaker={name}
                    content={entry.content}
                    slot={slot}
                    revealedCount={entry.revealedCount}
                    visible={entry.visible}
                    onClick={uiConfig.messageWindow.interactive ? skipTyping : undefined}
                    fontFamily={uiConfig.font.family}
                    fontSizePx={uiConfig.font.sizePx}
                    offsetPx={uiConfig.messageWindow.offset}
                  />
                </div>
              );
            })}

        {uiVis.messageWindow && !messageWindowHidden && bubbles.narrator && (
          <div style={isOverlay ? { pointerEvents: 'auto' } : undefined}>
            <renderer.NarratorCaption
              content={bubbles.narrator.content}
              revealedCount={bubbles.narrator.revealedCount}
              visible={bubbles.narrator.visible}
              onClick={uiConfig.messageWindow.interactive ? skipTyping : undefined}
              fontFamily={uiConfig.font.family}
              fontSizePx={uiConfig.font.sizePx}
            />
          </div>
        )}
      </div>

      {uiVis.backlogButton && uiConfig.backlog.show && backlogOpen && (
        <div
          className="vnlayer-scroll-hidden"
          style={
            backlogAnchorSlot
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
                }
          }
        >
          {lines.length === 0 && <div style={{ opacity: 0.5, fontSize: 12 }}>まだ会話がありません</div>}
          {lines.map((line, i) =>
            line.kind === 'choice' ? (
              <div key={i}>
                <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 2 }}>[Choice]</div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {line.number}. {line.text}
                </div>
              </div>
            ) : (
              <div key={i}>
                {line.speaker && (
                  <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 2 }}>[{line.speaker}]</div>
                )}
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{line.content}</div>
              </div>
            )
          )}
        </div>
      )}

      {uiVis.choices && !choicesHidden && visibleChoices.length > 0 && (
        <div
          className="vnlayer-scroll-hidden"
          style={
            choiceAnchorSlot
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
                }
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: uiConfig.choice.spacing ?? 8 }}>
            {visibleChoices.map((c: any) => (
              <renderer.ChoiceButton
                key={c.index}
                text={c.text}
                onClick={() => choose(c.index)}
                disabled={isProcessing || !uiConfig.choice.interactive}
                fontFamily={uiConfig.font.family}
                fontSizePx={uiConfig.font.sizePx}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
