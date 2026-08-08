import type { RunResult } from "./types";

// 「Inkを1歩進めて、次の選択肢が出るところまでの結果を返す」ための抽象インターフェース。
// useStoryEngineはこのインターフェースの実装(StepProvider)を受け取って動くだけで、
// 実際にInkがどこで動いているか(Next.jsのAPI Route経由か、ブラウザ内で直接inkjsを
// 実行しているか)は一切知らない。
//
// 実装例:
//   - serverStepProvider.ts … 既存通り /api/story を叩く(Next.js運用・本番向け)
//   - staticStepProvider.ts … ブラウザ内でinkjsを直接実行する
//     (index.html + vnlayer.js だけで動く静的運用向け)
//
// atomKey(第2/第3引数、省略可): #interrupt(SwitchFlow経由の割り込み、
// core/managers/interruptManager.ts参照)がVNインスタンス単位でStoryを
// 分離・監視する必要があるため追加した識別子。Reactを経由しない直接利用
// (StepProviderをReact無しで叩く場合)では省略してよく、その場合は
// scenario単独をキーにする以前の挙動にフォールバックする(実装依存)。
export interface StepProvider {
  init(scenario: string, atomKey?: string): Promise<RunResult>;
  choose(scenario: string, index: number, atomKey?: string): Promise<RunResult>;
  // Ink本文の進行には触れない、一方通行の変数書き込み(アイドル演出・setContext用)
  idle(scenario: string, varName: string, value: unknown, atomKey?: string): Promise<void>;
  reset(scenario: string, atomKey?: string): Promise<RunResult>;
  // #interrupt(SwitchFlow経由の割り込み)のように、init/choose/resetの
  // レスポンスを介さず「非同期に」新しいRunResultが発生する場合の購読口。
  // 対応していない実装(サーバー版等、現状は未対応)ではundefinedのままでよく、
  // 呼び出し側(core/useStoryEngine.ts)もoptional chainingで無視する。
  onPush?(atomKey: string, callback: (result: RunResult) => void): () => void;
}
