// core/ 以下はサーバー(Next.js)にもブラウザ単体運用にも依存しない、
// 「Inkの実行結果をどう状態に変換して画面に渡すか」だけを扱う層。
// fetchやnext/navigationへの依存はここには一切書かない
// (それらはcontext/StoryContext.tsxやapi.ts側の「つなぎ込み」に閉じ込める)。

export type Choice = { text: string; index: number; tags: string[] };
export type CharacterState = {
  expression: string;
  motion?: string;
  // anim_loop:で立てるフラグ。ループ再生中かどうか
  animLoop?: boolean;
  // anim_speed:で設定する再生速度倍率(1が通常速度)
  animSpeed?: number;
  // anim_reverse:で立てるフラグ。逆再生中かどうか
  animReverse?: boolean;
  // gaze:で設定する「視線の先」の座標(originX/originY、%、ステージ全体基準)。
  // 素材のキャラ絵が入るまでのモック段階で、視線の向き(矢印)を確認するためのもの。
  gaze?: { x: number; y: number };
};
export type CamState = { target: string; scale: number; originX: number; originY: number };
export type ShakeState = { nonce: number; amplitude: number; duration: number };
export type LineEntry = { speaker: string; content: string };
export type PositionOverrides = Record<string, { originX: number; originY: number }>;
export type ActiveMessage =
  | { speaker: string; content: string; fadeIn: boolean; typeSpeedMs: number }
  | null;

// app/api/story/route.ts のレスポンス形状(lib/story/server/engine.ts の RunResult と対応)。
// StepProviderの戻り値の形なので、サーバー版・静的版どちらの実装もこの形に合わせる。
export type StepEntry = { speaker: string; content: string; tags: string[] };
export type VisualState = { bg: string; characters: Record<string, CharacterState>; speaker: string };
export type RunResult = { steps: StepEntry[]; choices: Choice[]; visual: VisualState };

// useStoryEngineが返す値の形。VNLayer/components側はこれだけを見て描画する
// (StepProviderの実装がサーバー版か静的版かを一切意識しない)。
export type StoryEngine = {
  lines: LineEntry[];
  choices: Choice[];
  bg: string;
  characters: Record<string, CharacterState>;
  speaker: string;
  cam: CamState;
  shake: ShakeState;
  userLine: string;
  isProcessing: boolean;
  choose: (index: number) => Promise<void>;
  choicesHidden: boolean;
  // msg_window:hide/show タグで切り替える、メッセージウィンドウ(吹き出し・ナレーション
  // キャプション)全体のScene単位の表示/非表示。個々のmsg:transient等とは別の、
  // choicesHiddenと対になる「このシーンでは吹き出し自体を出さない」フラグ。
  messageWindowHidden: boolean;
  positionOverrides: PositionOverrides;
  activeMessage: ActiveMessage;
  hasLoadedOnce: boolean;
  resetStory: () => Promise<void>;
  flash: { color: string; durationMs: number } | null;
  typeSpeedMs: number;
  // 外部(VNLayer.setContext等)から一方通行でInk変数へ値を反映するための口。
  setContextVars: (vars: Record<string, unknown>) => Promise<void>;
};
