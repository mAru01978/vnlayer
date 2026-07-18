// 各タグ定義(tags/defs/*.ts)が呼び出す、状態更新のための最終的な口。
// 「ラベル→実際の値」の変換(config解決)は全部タグ定義側の責務にして、
// ここに来る時点では全て解決済みの値(ms, scale, 座標等)だけを受け取る。
export type SceneHandlers = {
  setBg: (name: string) => void;
  setChar: (name: string, expression: string) => void;
  setAnim: (name: string, motion: string) => void;
  setSpeaker: (name: string) => void;
  onGoto: (path: string) => void;
  wait: (ms: number) => Promise<void>;
  // scale/durationは既にcam.tsが解決済みの値
  setCamera: (scale: number, target: string | undefined, durationMs: number) => void;
  shakeScreen: (amplitude: number, durationMs: number) => void;
  onUnknownTag?: (tag: string) => void;

  hideChar: (name: string) => void;
  setChoicesVisible: (visible: boolean) => void;
  // msgwindow:hide/show 用。choices:hide/showと対になる、メッセージウィンドウ
  // (吹き出し・ナレーションキャプション)全体のScene単位の表示/非表示切り替え。
  setMessageWindowVisible: (visible: boolean) => void;
  // 'reset' か、既に解決済みの座標
  setPos: (name: string, coords: { originX: number; originY: number } | 'reset') => void;
  clearLines: () => void;
  // transientDurationMsはtransient指定時のみ意味を持つ
  setMessageMode: (mode: 'transient' | 'persist' | 'hide', transientDurationMs?: number) => void;
  handleFlash: (color: string, durationMs: number) => void;
  setNextRevealFade: (fadeIn: boolean) => void;
  setTypeSpeed: (ms: number) => void;
  setTypeWaitMode: (enabled: boolean, readingBufferMs?: number) => void;
};
