import type { ReactNode } from "react";
export type CharacterState = {
  expression: string;
  motion?: string;
  animLoop?: boolean;
  animSpeed?: number;
  animReverse?: boolean;
  gaze?: {
    x: number;
    y: number;
  };
};
export type Slot = {
  originX: number;
  originY: number;
  durationMs?: number;
};
export type BackgroundProps = {
  bg: string;
};
export type CharacterSpriteProps = {
  name: string;
  state: CharacterState;
  slot: Slot;
  isFocused: boolean;
  hasSpeaker: boolean;
  onClick?: () => void;
};
export type MessageBubbleProps = {
  speaker: string;
  content: string;
  slot: Slot;
  revealedCount: number;
  visible: boolean;
  onClick: () => void;
  fontFamily?: string;
  fontSizePx?: number;
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
};
export type StageRenderer = {
  Background: (props: BackgroundProps) => ReactNode;
  CharacterSprite: (props: CharacterSpriteProps) => ReactNode;
  MessageBubble: (props: MessageBubbleProps) => ReactNode;
  NarratorCaption: (props: NarratorCaptionProps) => ReactNode;
  ChoiceButton: (props: ChoiceButtonProps) => ReactNode;
  FlashOverlay: (props: FlashOverlayProps) => ReactNode;
};
//# sourceMappingURL=types.d.ts.map
