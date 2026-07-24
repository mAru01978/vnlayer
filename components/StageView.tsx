'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
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
  // バックログ開閉ボタン(+パネル)
  backlogButton?: boolean;
  // 選択肢欄(ink側のchoices:hide/showとはAND条件。どちらかがfalseなら非表示)
  choices?: boolean;
  // 吹き出し・ナレーションキャプション(ink側のmsg_window:hide/showとはAND条件)
  messageWindow?: boolean;
  // 「あなた: ...」欄
  userLine?: boolean;
};

export default function StageView({
  mode = 'full',
  uiAnchor = 'right',
  showUi = true,
}: {
  mode?: StageMode;
  uiAnchor?: UiAnchor;
  // true/false で一括指定、または個別に真偽値を指定できる。
  // これはホスト側(mount側)が決める「表示できる上限」で、ink側のタグ
  // (choices:hide/show, msg_window:hide/show)はこの上限の内側でのみ効く
  // (ホスト側でfalseにした要素は、ink側からは復活させられない)。
  showUi?: boolean | UiVisibility;
}) {
  const story = useStory();
  const [backlogOpen, setBacklogOpen] = useState(false);

  const [displayedMessage, setDisplayedMessage] = useState<{
    speaker: string;
    content: string;
    fadeIn?: boolean;
    typeSpeedMs?: number;
  } | null>(null);
  const [bubbleShown, setBubbleShown] = useState(false);
  const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeMessage = story?.activeMessage ?? null;

  const [revealedCount, setRevealedCount] = useState(0);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, speedForThisMessage);

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
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
    } else {
      setBubbleShown(false);
      fadeOutTimerRef.current = setTimeout(() => setDisplayedMessage(null), BUBBLE_FADE_MS);
    }

    return () => {
      if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMessage]);

  if (!story) return null;

  const {
    lines,
    choices,
    bg,
    characters,
    speaker,
    cam,
    shake,
    userLine,
    isProcessing,
    choose,
    choicesHidden,
    messageWindowHidden,
    positionOverrides,
  } = story;

  const visibleChoices = choices.filter(
    (c: any) => !c.tags?.some((t: string) => ['tick', 'interrupt'].includes(t.split(':')[0]))
  );

  const camStyle: CSSProperties = {
    transform: `scale(${cam.scale})`,
    transformOrigin: `${cam.originX}% ${cam.originY}%`,
    transition: 'transform 500ms ease',
  };

  const isNarratorMessage = displayedMessage?.speaker === 'narrator';

  const bubbleSlot =
    displayedMessage && !isNarratorMessage
      ? positionOverrides[displayedMessage.speaker] ?? getCharacterSlot(displayedMessage.speaker) ?? { originX: 50, originY: 40 }
      : null;

  const isOverlay = mode === 'overlay';
  const anchorSide: CSSProperties = uiAnchor === 'left' ? { left: 12 } : { right: 12 };

  // #ui:choice:anchor:<キャラ名> が指定されていれば、選択肢をそのキャラの
  // スロット位置基準で表示する(未指定なら従来通りuiAnchorのステージ角固定)。
  const uiConfig = getUiConfig();
  const choiceAnchorName = uiConfig.choice.anchor;
  const choiceAnchorSlot = choiceAnchorName
    ? positionOverrides[choiceAnchorName] ?? getCharacterSlot(choiceAnchorName) ?? null
    : null;

  const uiVis: Required<UiVisibility> =
    typeof showUi === 'boolean'
      ? { backlogButton: showUi, choices: showUi, messageWindow: showUi, userLine: showUi }
      : {
          backlogButton: showUi.backlogButton ?? true,
          choices: showUi.choices ?? true,
          messageWindow: showUi.messageWindow ?? true,
          userLine: showUi.userLine ?? true,
        };

  const outerStyle: CSSProperties = isOverlay
    ? { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, fontFamily: 'sans-serif' }
    : { maxWidth: 640, margin: '0 auto', fontFamily: 'sans-serif' };

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
    <div style={outerStyle}>
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
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* 旧Edge/IE */
        }
        .vnlayer-scroll-hidden::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
      `}</style>

      {uiVis.backlogButton && (
        <div
          style={
            isOverlay
              ? { position: 'fixed', ...anchorSide, bottom: 12, pointerEvents: 'auto', zIndex: 51 }
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
                onClick={() => story.notify('char_click', name)}
              />
            );
          })}

          {story.flash && <renderer.FlashOverlay color={story.flash.color} durationMs={story.flash.durationMs} />}
        </div>

        {uiVis.messageWindow && !messageWindowHidden && displayedMessage && !isNarratorMessage && bubbleSlot && (
          <div style={isOverlay ? { pointerEvents: 'auto' } : undefined}>
            <renderer.MessageBubble
              speaker={displayedMessage.speaker}
              content={displayedMessage.content}
              slot={bubbleSlot}
              revealedCount={revealedCount}
              visible={bubbleShown}
              onClick={skipTyping}
            />
          </div>
        )}

        {displayedMessage && isNarratorMessage && (
          <div style={isOverlay ? { pointerEvents: 'auto' } : undefined}>
            <renderer.NarratorCaption
              content={displayedMessage.content}
              revealedCount={revealedCount}
              visible={bubbleShown}
              onClick={skipTyping}
            />
          </div>
        )}
      </div>

      {uiVis.backlogButton && backlogOpen && (
        <div
          style={{
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
          }}
        >
          {lines.length === 0 && <div style={{ opacity: 0.5, fontSize: 12 }}>まだ会話がありません</div>}
          {lines.map((line: any, i: number) => (
            <div key={i}>
              {line.speaker && <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 2 }}>{line.speaker}</div>}
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{line.content}</div>
            </div>
          ))}
        </div>
      )}

      {uiVis.userLine && userLine && (
        <div
          style={{
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
          }}
        >
          あなた: {userLine}
        </div>
      )}

      {/* 修正メモ(切り出し対応): 以前はvisibleChoices.length===0の時に
          「今日の営業はここまでのようです」+「はじめから」ボタンを固定で
          描画していたが、これはこのプロジェクト固有の文言・演出であり、
          汎用コンポーネントであるVNLayerが持つべきものではなかった。
          今は選択肢が無い間は何も描画しない。終了時のメッセージや
          「最初に戻る」導線が欲しい場合は、Ink側で s:narrator/msg等を使い
          普通のテキストとして書くか、"+[はじめから] -> home" のような
          本物の選択肢として書くのが自然。JS側から明示的にリセットしたい
          場合は VNLayer.reset(selector) を呼べる(api.ts参照)。 */}
      {uiVis.choices && !choicesHidden && visibleChoices.length > 0 && (
        <div
          className="vnlayer-scroll-hidden"
          style={
            choiceAnchorSlot
              ? {
                  // キャラのスロット位置基準(#ui:choice:anchor:name指定時)。
                  // メッセージ吹き出しと同じ座標系(ステージ全体基準%、カメラズームの
                  // 影響を受けない)に合わせてある。
                  // offsetはanchor時にも効く: 「キャラの位置から何pxの余白を
                  // 空けて選択肢を出すか」として共用する(既定表示時は
                  // 「画面端からの距離」、anchor時は「キャラ位置からの距離」)。
                  position: 'absolute',
                  left: `${choiceAnchorSlot.originX}%`,
                  top: `calc(${choiceAnchorSlot.originY}% + ${uiConfig.choice.offset ?? 20}px)`,
                  transform: 'translateX(-50%)',
                  width: isOverlay ? 220 : 200,
                  // 選択肢の数が多いと画面外まではみ出すことがあるため、
                  // topの位置に応じて残りスペースぶんだけしか高さを取らない
                  // ようcalc()で連動させる(どこにanchorしても必ず画面内に収まる)。
                  // 超えた分は内部スクロールにする(スクロールバー自体は
                  // 下のvnlayer-scroll-hidden CSSで見た目だけ非表示にしている)。
                  maxHeight: `calc(100% - ${choiceAnchorSlot.originY}% - ${uiConfig.choice.offset ?? 20}px - 8px)`,
                  overflowY: 'auto',
                  pointerEvents: 'auto',
                  zIndex: 51,
                }
              : {
                  // 既定: ステージの角(uiAnchor)に固定表示。
                  position: isOverlay ? 'fixed' : 'static',
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
                disabled={isProcessing}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
