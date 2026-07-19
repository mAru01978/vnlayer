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
};
export type Slot = { originX: number; originY: number };

export type BackgroundProps = {
  bg: string;
};

export type CharacterSpriteProps = {
  name: string;
  state: CharacterState;
  slot: Slot;
  isFocused: boolean;
  hasSpeaker: boolean;
};

export type MessageBubbleProps = {
  speaker: string;
  content: string;
  slot: Slot;
  revealedCount: number;
  visible: boolean;
  onClick: () => void;
};

export type NarratorCaptionProps = {
  content: string;
  revealedCount: number;
  visible: boolean;
  onClick: () => void;
};

export type ChoiceButtonProps = {
  text: string;
  onClick: () => void;
  disabled: boolean;
};

export type FlashOverlayProps = {
  color: string;
  durationMs: number;
};

export type StageRenderer = {
  Background: (props: BackgroundProps) => ReactNode;
  CharacterSprite: (props: CharacterSpriteProps) => ReactNode;
  MessageBubble: (props: MessageBubbleProps) => ReactNode;
  NarratorCaption: (props: NarratorCaptionProps) => ReactNode;
  ChoiceButton: (props: ChoiceButtonProps) => ReactNode;
  FlashOverlay: (props: FlashOverlayProps) => ReactNode;
};
