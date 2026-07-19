// 今の「色付きの四角+テキストラベル」の見た目一式(mock実装)。
// 素材が揃ったら、このファイルと同じ形の realRenderer.tsx を新しく作り、
// import側を1行差し替えるだけで本番の見た目に切り替えられるようにしてある。

import type {
  StageRenderer,
  BackgroundProps,
  CharacterSpriteProps,
  MessageBubbleProps,
  NarratorCaptionProps,
  ChoiceButtonProps,
  FlashOverlayProps,
} from './types';

const BG_COLORS: Record<string, string> = {
  izakaya_main_day: '#f3e3c8',
  izakaya_main_evening: '#e6b06a',
  izakaya_main_night: '#2b2440',
  izakaya_main_closed: '#4a4a4a',
};

// キャラの立ち位置(originX/originY、%)から視線ターゲット(gaze.x/gaze.y、%)への
// 向きを角度(度)で返す。ステージが正方形でない場合の縦横比の歪みは無視した
// 簡易計算(モック確認用としては十分)。
function computeGazeAngleDeg(fromX: number, fromY: number, toX: number, toY: number): number {
  const dx = toX - fromX;
  const dy = toY - fromY;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

function resolveBgColor(bg: string): string {
  const key = bg.replace(':', '_');
  return BG_COLORS[`izakaya_main_${bg.split(':')[1] ?? bg}`] ?? BG_COLORS[key] ?? '#333';
}

const BUBBLE_FADE_MS = 800;

function Background({ bg }: BackgroundProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: resolveBgColor(bg),
      }}
    />
  );
}

function CharacterSprite({ name, state, slot, isFocused, hasSpeaker }: CharacterSpriteProps) {
  console.log({
  name,
  slot,
  gaze: state.gaze,
});
  const gazeAngle = state.gaze
    ? computeGazeAngleDeg(slot.originX, slot.originY, state.gaze.x, state.gaze.y)
    : null;

  return (
    <>
      <div
        style={{
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
        }}
      >
        <div>{name}</div>
        <div style={{ fontSize: 10, opacity: 0.8 }}>
          {state.expression}
          {state.motion ? ` / ${state.motion}` : ''}
          {state.animLoop ? ' 🔁' : ''}
          {state.animReverse ? ' ⏪' : ''}
          {state.animSpeed !== undefined && state.animSpeed !== 1 ? ` x${state.animSpeed}` : ''}
        </div>
      </div>

      {/* 視線矢印(モック専用)。頭の少し上に置き、gaze:で指定された座標の方向へ
          回転させるだけの簡易表示。素材が入ったらrealRenderer側では実際の目線の
          描き分け(瞳の位置、顔の向き等)に置き換わる想定で、ここではあくまで
          「gazeタグの値が正しく反映されているか」を確認するための目印。 */}
      {gazeAngle !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${slot.originX}%`,
            top: `${slot.originY}%`,
            transform: `translate(-50%, -50%) translateY(-84px) rotate(${gazeAngle}deg)`,
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderLeft: '14px solid #ffd54a',
            transition: 'transform 150ms linear, left 500ms ease, top 500ms ease',
            pointerEvents: 'none',
            zIndex: 6,
          }}
        />
      )}
    </>
  );
}

function MessageBubble({ speaker, content, slot, revealedCount, visible, onClick }: MessageBubbleProps) {
  return (
    <div
      onClick={onClick}
      style={{
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
      }}
    >
      {speaker && <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 2 }}>{speaker}</div>}
      <div style={{ whiteSpace: 'pre-wrap' }}>{content.slice(0, revealedCount)}</div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: -8,
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(255,255,255,0.95)',
        }}
      />
    </div>
  );
}

function NarratorCaption({ content, revealedCount, visible, onClick }: NarratorCaptionProps) {
  return (
    <div
      onClick={onClick}
      style={{
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
      }}
    >
      {content.slice(0, revealedCount)}
    </div>
  );
}

function ChoiceButton({ text, onClick, disabled }: ChoiceButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 14px',
        borderRadius: 6,
        border: '1px solid #ccc',
        background: disabled ? '#eee' : '#fff',
        color: '#111',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      {text}
    </button>
  );
}

function FlashOverlay({ color, durationMs }: FlashOverlayProps) {
  return (
    <>
      <style>{`
        @keyframes izakaya-mock-flash-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: color,
          pointerEvents: 'none',
          zIndex: 10,
          animation: `izakaya-mock-flash-fade-out ${durationMs}ms ease-out forwards`,
        }}
      />
    </>
  );
}

export const mockRenderer: StageRenderer = {
  Background,
  CharacterSprite,
  MessageBubble,
  NarratorCaption,
  ChoiceButton,
  FlashOverlay,
};
