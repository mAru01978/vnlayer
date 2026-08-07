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

// setContextVars(vars, options?)の第2引数。
//   notify   … 各キーに"${key}_seq"を自動生成・インクリメントして一緒に
//              書き込み、実行中の#wait:/type_wait待ちを即座に打ち切り、
//              演出中の全GSAP timelineも一時停止する(core/managers/
//              waitManager.ts参照)。event_loop等の#interrupt付き選択肢に
//              辿り着き次第それを自動選択する。
//   expose   … falseにするとgetContextVars()から見えなくなる(既定true)。
//   keyNames … vars内のネストしたオブジェクトを「${親キー}_${子キー}」の
//              ようなink変数名にフラット化する際、既定の命名を上書きする
//              ための対応表。varsと同じ構造で、上書きしたい葉の値だけ
//              文字列(使いたい変数名)にする。
//              例: setContext({ weather: { temp: 22.2, text: "晴れ" } },
//                    sel, { keyNames: { weather: { temp: 'w_temp' } } })
//                  → w_temp = 22.2 (上書き) / weather_text = "晴れ" (既定)
//              衝突チェックは行わない(単に読みやすくするための糖衣構文で、
//              実質的にはink変数を自分で定義するのと同じことをしているだけ、
//              という位置づけのため)。
export type SetContextKeyNames = { [key: string]: string | SetContextKeyNames };
export type SetContextOptions = {
  notify?: boolean;
  expose?: boolean;
  keyNames?: SetContextKeyNames;
};

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
  // api-refactor-1/2: 外部(VNLayer.setContext等)から一方通行でInk変数へ値を
  // 反映するための口。SetContextOptions参照。
  setContextVars: (vars: Record<string, unknown>, options?: SetContextOptions) => Promise<void>;
  // api-refactor-2: setContextVarsの読み取り版。setContextVarsで(expose:false
  // でなく)書き込まれた値の写しを返す。varNames省略時はexposeされている
  // 値すべてを返す。ink本体には問い合わせない(サーバー往復が発生しない)。
  getContextVars: (varNames?: string[]) => Promise<Record<string, unknown>>;
  // このVNインスタンス自身の識別子(通常はmount()時のselector)。
  // #ui:...タグの設定をこのインスタンスだけにスコープするために、
  // StageView側がgetUiConfig(instanceId)を呼ぶ時に使う。未指定
  // (Next.js運用でinstanceIdを渡さなかった場合)はundefined。
  instanceId?: string;
  // タグシステム大改修(Jotai/GSAP導入)フェーズで追加。このVNインスタンス
  // 専用の状態隔離キー(instanceId未指定時はcore/useStoryEngine.ts側が
  // useId()で生成したフォールバック値。常に一意)。
  // core/managers/以下の各マネージャーのatomFamilyキーや、
  // core/managers/timelineManager.tsのGSAP timeline登録キーとして使う。
  // instanceIdと違い「未指定=グローバル」という意味は持たない
  // (常に「このマウントインスタンス自身」を指す)。
  atomKey: string;
};
