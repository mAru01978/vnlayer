import type { RunResult } from "./types";

// 「Inkを1歩進めて、次の選択肢が出るところまでの結果を返す」ための抽象インターフェース。
// useStoryEngineはこのインターフェースの実装(StepProvider)を受け取って動くだけで、
// 実際にInkがどこで動いているか(Next.jsのAPI Route経由か、ブラウザ内で直接inkjsを
// 実行しているか)は一切知らない。
//
// 実装例:
//   - serverStepProvider.ts … 既存通り /api/story を叩く(Next.js運用・本番向け)
//   - staticStepProvider.ts(フェーズ2で追加予定) … ブラウザ内でinkjsを直接実行する
//     (index.html + vnlayer.js だけで動く静的運用向け)
export interface StepProvider {
  init(scenario: string): Promise<RunResult>;
  choose(scenario: string, index: number): Promise<RunResult>;
  // Ink本文の進行には触れない、一方通行の変数書き込み(アイドル演出・setContext用)
  idle(scenario: string, varName: string, value: unknown): Promise<void>;
  reset(scenario: string): Promise<RunResult>;
}
