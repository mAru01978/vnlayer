// 「何を描画するか(データ)」と「どう描画するか(見た目の実装)」を分離するための型定義。
// 本番で素材が揃ったら realRenderer.tsx を新しく作り、importを1行差し替えるだけで
// 全体の見た目を切り替えられるようにする。

import type { ReactNode } from 'react';

export type CharacterState = {
  expression: string;
  motion?: string;
  animLoop?: boolean;
  animSpeed?: number;
  animReverse?: boolean;
  gaze?: { x: number; y: number };
};
export type Slot = { originX: number; originY: number; durationMs?: number };

export type BackgroundProps = {
  bg: string;
  // タグシステム大改修(GSAP導入)フェーズで追加。このVNインスタンス専用の
  // 状態隔離キー。core/managers/timelineManager.tsへGSAP timelineを
  // 登録する際のキーとして使う(#timeline:pause等が「このインスタンスの
  // 演出だけ」を対象にできるようにするため)。
  atomKey: string;
};

export type CharacterSpriteProps = {
  name: string;
  state: CharacterState;
  slot: Slot;
  isFocused: boolean;
  hasSpeaker: boolean;
  // キャラをクリックされた時のコールバック(任意)。VNLayerOverlay側から渡された
  // 場合のみ呼ばれる。realRenderer側でも同じprops形状のままクリック領域を
  // 広げたりできる。onClickが渡された場合、実装側はoverlayモードでも
  // クリックが拾えるようpointerEvents:'auto'を自分自身に設定すること
  // (親のステージ全体はoverlayモードでpointerEvents:'none'になっているため)。
  onClick?: () => void;
  // BackgroundPropsのatomKeyと同じ(core/managers/timelineManager.ts登録用)。
  atomKey: string;
};

export type MessageBubbleProps = {
  speaker: string;
  content: string;
  slot: Slot;
  revealedCount: number;
  visible: boolean;
  onClick: () => void;
  // #ui:font:family/size で設定されたフォント(未指定ならrenderer側の既定値を使う)
  fontFamily?: string;
  fontSizePx?: number;
  // #ui:messageWindow:offset:<px> で設定される、キャラのoriginY(%)から
  // 吹き出し下端までの距離(px、既定130)。
  offsetPx: number;
};

export type NarratorCaptionProps = {
  content: string;
  revealedCount: number;
  visible: boolean;
  onClick: () => void;
  fontFamily?: string;
  fontSizePx?: number;
};

export type ChoiceButtonProps = {
  text: string;
  onClick: () => void;
  disabled: boolean;
  fontFamily?: string;
  fontSizePx?: number;
};

export type FlashOverlayProps = {
  color: string;
  durationMs: number;
  // BackgroundPropsのatomKeyと同じ(core/managers/timelineManager.ts登録用)。
  atomKey: string;
};

export type StageRenderer = {
  Background: (props: BackgroundProps) => ReactNode;
  CharacterSprite: (props: CharacterSpriteProps) => ReactNode;
  MessageBubble: (props: MessageBubbleProps) => ReactNode;
  NarratorCaption: (props: NarratorCaptionProps) => ReactNode;
  ChoiceButton: (props: ChoiceButtonProps) => ReactNode;
  FlashOverlay: (props: FlashOverlayProps) => ReactNode;
};
