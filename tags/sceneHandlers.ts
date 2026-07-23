// 各タグ定義(tags/defs/*.ts)が呼び出す、状態更新のための最終的な口。
// 「ラベル→実際の値」の変換(config解決)は全部タグ定義側の責務にして、
// ここに来る時点では全て解決済みの値(ms, scale, 座標等)だけを受け取る。
export type SceneHandlers = {
  setBg: (name: string) => void;
  setChar: (name: string, expression: string) => void;
  setAnim: (name: string, motion: string) => void;
  // anim_loop:名前:モーション → そのモーションをループ再生する指定
  setAnimLoop: (name: string, motion: string) => void;
  // anim_stop:名前 → 再生中のモーションを止める(表情はそのまま)
  setAnimStop: (name: string) => void;
  // anim_speed:名前:速度 → 再生速度の倍率(1が通常速度)。ラベル/数値どちらも
  // tags/defs/anim.ts(speed:サブモード)側で解決済みの数値としてここに渡ってくる。
  setAnimSpeed: (name: string, speed: number) => void;
  // anim_reverse:名前:モーション → そのモーションを逆再生する指定
  setAnimReverse: (name: string, motion: string) => void;
  // gaze:名前:x:y → 視線の先の座標(originX/originY、%)。'reset'で正面向きに戻す。
  // 素材が入る前のモック段階で、視線方向の矢印表示を確認するためのもの。
  setGaze: (name: string, target: { x: number; y: number } | 'reset') => void;
  setSpeaker: (name: string) => void;
  onGoto: (path: string) => void;
  // web:open:url → 新しいタブでURLを開く
  onOpen: (url: string) => void;
  // web:scroll:target → ページ内スクロール。数値ならY座標(px)へ、
  // それ以外はCSSセレクタ/id/アンカー名として scrollIntoView する。
  onScroll: (target: string) => void;
  wait: (ms: number) => Promise<void>;
  // scale/durationは既にcam.tsが解決済みの値
  setCamera: (scale: number, target: string | undefined, durationMs: number) => void;
  shakeScreen: (amplitude: number, durationMs: number) => void;
  onUnknownTag?: (tag: string) => void;

  hideChar: (name: string) => void;
  setChoicesVisible: (visible: boolean) => void;
  // msg_window:hide/show 用。choices:hide/showと対になる、メッセージウィンドウ
  // (吹き出し・ナレーションキャプション)全体のScene単位の表示/非表示切り替え。
  setMessageWindowVisible: (visible: boolean) => void;
  // 'reset' か、既に解決済みの座標
  // durationMsを省略すると既定の移動時間(500ms)。歩き演出等でゆっくり
  // 動かしたい場合に長めの値を指定できる。
  setPos: (name: string, coords: { originX: number; originY: number } | 'reset', durationMs?: number) => void;
  clearLines: () => void;
  // transientDurationMsはtransient指定時のみ意味を持つ
  setMessageMode: (mode: 'transient' | 'persist' | 'hide', transientDurationMs?: number) => void;
  handleFlash: (color: string, durationMs: number) => void;
  setNextRevealFade: (fadeIn: boolean) => void;
  setTypeSpeed: (ms: number) => void;
  setTypeWaitMode: (enabled: boolean, readingBufferMs?: number) => void;
};
