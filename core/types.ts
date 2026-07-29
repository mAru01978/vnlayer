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
// バックログの1エントリ。発言(kind:'line')か、選択した項目の記録(kind:'choice')。
// 選択肢は「表示されてたリストの何番目か(1始まり)」も一緒に持たせる
// (# ui:...等で除外されるtick/interrupt等の裏方選択肢は数に含めない)。
export type LineEntry =
  | { kind: 'line'; speaker: string; content: string }
  | { kind: 'choice'; number: number; text: string };
export type PositionOverrides = Record<string, { originX: number; originY: number; durationMs?: number }>;
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
  // api-refactor-1: 外部(VNLayer.setContext等)から一方通行でInk変数へ値を
  // 反映するための口。以前はこれとは別に「値を書いて即時反応もさせる」
  // notify()というAPIがあったが、notifyの中身は実質「setContextVars+wake()」
  // でしかなかったため、options.notify:trueへ一本化した。
  //   setContextVars({ vn_event_char_click: name, vn_event_char_click_seq: n })
  //     → 値を書き込むだけ(今まで通り)
  //   setContextVars({ ... }, { notify: true })
  //     → 値を書き込み、同時に実行中の#wait:/type_wait待ちを即座に打ち切り、
  //       event_loop等の#interrupt付き選択肢に辿り着き次第それを自動選択する
  //       (=以前のnotify()と同じ効果)
  // event_${name}/_seqという変数名の自動組み立ては廃止した。呼び出し側
  // (api.tsのVNLayer.notify()、StageView内部のキャラクリック処理等)が
  // 変数名(vn_event_xxx等の命名規則含む)を明示的に組み立てて渡す。
  // api-refactor-1/2: 外部(VNLayer.setContext等)から一方通行でInk変数へ値を
  // 反映するための口。
  //   setContextVars(vars)
  //     → 値を書き込むだけ。既定(expose:true)でgetContextVars()から見える
  //       ようになる。
  //   setContextVars(vars, { notify: true })
  //     → 上記に加え、渡した各キーに"${key}_seq"を自動生成・インクリメント
  //       して書き込み、実行中の#wait:/type_wait待ちを即座に打ち切り、
  //       event_loop等の#interrupt付き選択肢に辿り着き次第それを自動選択する
  //       (以前の別APIだったnotify()の役割を吸収した)。
  //   setContextVars(vars, { expose: false })
  //     → Inkへは書き込むが、getContextVars()からは見えないようにする
  //       (将来の#emit特殊タグ等、内部的な書き込みを外部に露出させたくない
  //       場合向け)。
  // 変数名(vn_event_xxx等の命名規則)自体は呼び出し側が決めて渡す。
  setContextVars: (vars: Record<string, unknown>, options?: { notify?: boolean; expose?: boolean }) => Promise<void>;
  // api-refactor-2: setContextVarsの読み取り版。setContextVarsで(expose:false
  // でなく)書き込まれた値の写しを返す。varNames省略時はexposeされている
  // 値すべてを返す。ink本体には問い合わせない(サーバー往復が発生しない)。
  getContextVars: (varNames?: string[]) => Promise<Record<string, unknown>>;
  // このVNインスタンス自身の識別子(通常はmount()時のselector)。
  // #ui:...タグの設定をこのインスタンスだけにスコープするために、
  // StageView側がgetUiConfig(instanceId)を呼ぶ時に使う。
  instanceId?: string;
};
