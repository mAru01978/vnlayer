// core/useStoryEngine.tsのadvance()ループが1バッチ(=タグ処理のまとまり)
// ごとに使う、「世代(generation)」「中断可能な待ち(AbortController)」
// 「interrupt要求の保留」をまとめたマネージャー。
//
// 以前はこれら全部がcore/useStoryEngine.ts内のuseRef群
// (advanceGenerationRef/abortControllerRef/pendingInterruptRef)として
// ベタ書きされていたが、この機構自体はタグ処理のバッチ管理という独立した
// 関心事なので、atomKeyをキーにしたモジュールスコープのMapへ切り出した。
// これによりuseStoryEngine.ts側は「バッチの始まりでbeginBatch()を呼び、
// 適宜isStale()をチェックするだけ」で済むようになる。
//
// #wait:/#cam(resolveWaitMs)/type_wait推定待ち等、「途中でnotify()により
// 即座に打ち切られてほしい待ち」は全部ここのwait()を経由する。
import { abortableSleep } from "../abortableSleep";

type BatchState = {
  generation: number;
  controller: AbortController | null;
};

const batches = new Map<string, BatchState>();
const pendingInterrupt = new Map<string, boolean>();

function getBatch(atomKey: string): BatchState {
  let batch = batches.get(atomKey);
  if (!batch) {
    batch = { generation: 0, controller: null };
    batches.set(atomKey, batch);
  }
  return batch;
}

// 新しいバッチ(advance()の1回の呼び出し)を開始し、その世代番号を返す。
// 呼び出し側はこの番号を保持しておき、isStale(atomKey, myGeneration)で
// 「自分より新しいバッチが始まっていないか」を随時チェックする。
export function beginBatch(atomKey: string): number {
  const batch = getBatch(atomKey);
  batch.generation += 1;
  return batch.generation;
}

export function isStale(atomKey: string, generation: number): boolean {
  return getBatch(atomKey).generation !== generation;
}

export function getCurrentGeneration(atomKey: string): number {
  return getBatch(atomKey).generation;
}

// 中断可能な待ち。#wait:等のタグ処理中に呼ばれる想定。
// 呼び出しごとに新しいAbortControllerを発行する: バッチ全体で1つの
// controllerを使い回すと、「このwaitより前に来たクリック」がまだ発生
// してもいない後続の#wait:まで巻き込んで即座に打ち切ってしまうバグに
// なる(実際に過去そうなっていた)。waitごとに新しいcontrollerにすることで、
// interrupt()は「今まさに実行中のwait」だけに効き、まだ始まっていない
// 後続のwaitには影響しなくなる。
export function wait(atomKey: string, ms: number): Promise<void> {
  const batch = getBatch(atomKey);
  const controller = new AbortController();
  batch.controller = controller;
  return abortableSleep(ms, controller.signal);
}

// notify()相当。実行中のwait/type_wait推定待ちを即座に打ち切り、
// 「割り込み要求があった」ことを記録する(event_loop等の#interrupt付き
// 選択肢に辿り着き次第それを自動選択するために、core/useStoryEngine.ts
// 側がconsumePendingInterrupt()で消費する)。
export function interrupt(atomKey: string): void {
  pendingInterrupt.set(atomKey, true);
  getBatch(atomKey).controller?.abort();
}

// 呼ぶと同時に「消費」してfalseへ戻す。保留フラグは「次に選択肢が提示される
// この1回」でしか有効ではない(以前からの設計、core/useStoryEngine.tsの
// tick/interrupt処理useEffectのコメント参照)。
export function consumePendingInterrupt(atomKey: string): boolean {
  const value = pendingInterrupt.get(atomKey) ?? false;
  pendingInterrupt.set(atomKey, false);
  return value;
}

// resetStory()用。進行中の古いバッチがあってもstale扱いにし、以後の
// 待ちも打ち切る。
export function reset(atomKey: string): void {
  const batch = getBatch(atomKey);
  batch.generation += 1;
  batch.controller?.abort();
  pendingInterrupt.set(atomKey, false);
}

export function dispose(atomKey: string): void {
  getBatch(atomKey).controller?.abort();
  batches.delete(atomKey);
  pendingInterrupt.delete(atomKey);
}
