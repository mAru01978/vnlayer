import type { RunResult } from "./types";
import type { SaveData, StorySaveData } from "./SaveProvider";

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
// 用語メモ(2026-08-08、Scenario→Clip改称): 以前「Scenario」と呼んでいた
// 単位(1本のInk本文+それに紐づくstory.json)は、スクリプトというほど固定的
// でもなく、かといってイベント駆動な使い方もできる(#interrupt等)、という
// 性質がFlashの「クリップ」に近いという判断からClipへ改称した。JS(vnlayer.js)
// 側・React側どちらのAPIも指定キーは統一して `clip` になる(以前の
// `scenario` は完全に置き換え、両立はさせない)。
//
// atomKey(第2/第3引数、省略可): #interrupt(SwitchFlow経由の割り込み、
// core/managers/interruptManager.ts参照)がVNインスタンス単位でStoryを
// 分離・監視する必要があるため追加した識別子。Reactを経由しない直接利用
// (StepProviderをReact無しで叩く場合)では省略してよく、その場合は
// clip単独をキーにする以前の挙動にフォールバックする(実装依存)。
export interface StepProvider {
  init(clip: string, atomKey?: string): Promise<RunResult>;
  choose(clip: string, index: number, atomKey?: string): Promise<RunResult>;
  // Ink本文の進行には触れない、一方通行の変数書き込み(アイドル演出・setContext用)
  idle(
    clip: string,
    varName: string,
    value: unknown,
    atomKey?: string,
  ): Promise<void>;
  reset(clip: string, atomKey?: string): Promise<RunResult>;
  // #interrupt(SwitchFlow経由の割り込み)のように、init/choose/resetの
  // レスポンスを介さず「非同期に」新しいRunResultが発生する場合の購読口。
  // 対応していない実装(サーバー版等、現状は未対応)ではundefinedのままでよく、
  // 呼び出し側(core/useStoryEngine.ts)もoptional chainingで無視する。
  onPush?(atomKey: string, callback: (result: RunResult) => void): () => void;
  // 簡易セーブ機能(core/SaveProvider.ts参照)用。対応していれば、現在の
  // ink実行状態+見た目スナップショットをStorySaveDataとして取り出せる。
  // 対応していない実装(サーバー版等、現状は未対応 — サーバー側cookie
  // セッションで元々永続化されているため)ではundefinedのままでよい。
  getSaveData?(clip: string, atomKey?: string): Promise<StorySaveData | null>;
  // 簡易セーブ機能用。保存済みSaveDataから状態を復元し、続きから再開できる
  // RunResult(新規のnarrationは発生させず、保存時点の選択肢をそのまま返す)
  // を返す。対応していなければcore/useStoryEngine.ts側は通常のinit()に
  // フォールバックする。
  restore?(clip: string, save: SaveData, atomKey?: string): Promise<RunResult>;
}
