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
//
// #interrupt付き選択肢への割り込み時に演出(GSAP timeline)もpause/resumeする
// 処理は、ここではなくcore/useStoryEngine.tsのtick/interrupt処理useEffect側に
// ある(理由は下のinterrupt()のコメント参照)。
import { abortableSleep } from "../abortableSleep";
const batches = new Map();
const pendingInterrupt = new Map();
function getBatch(atomKey) {
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
export function beginBatch(atomKey) {
  const batch = getBatch(atomKey);
  batch.generation += 1;
  return batch.generation;
}
export function isStale(atomKey, generation) {
  return getBatch(atomKey).generation !== generation;
}
export function getCurrentGeneration(atomKey) {
  return getBatch(atomKey).generation;
}
// 中断可能な待ち。#wait:等のタグ処理中に呼ばれる想定。
// 呼び出しごとに新しいAbortControllerを発行する: バッチ全体で1つの
// controllerを使い回すと、「このwaitより前に来たクリック」がまだ発生
// してもいない後続の#wait:まで巻き込んで即座に打ち切ってしまうバグに
// なる(実際に過去そうなっていた)。waitごとに新しいcontrollerにすることで、
// interrupt()は「今まさに実行中のwait」だけに効き、まだ始まっていない
// 後続のwaitには影響しなくなる。
export function wait(atomKey, ms) {
  const batch = getBatch(atomKey);
  const controller = new AbortController();
  batch.controller = controller;
  return abortableSleep(ms, controller.signal);
}
// notify()相当。実行中のwait/type_wait推定待ちを即座に打ち切り、
// 「割り込み要求があった」ことを記録する(event_loop等の#interrupt付き
// 選択肢に辿り着き次第それを自動選択するために、core/useStoryEngine.ts
// 側がconsumePendingInterrupt()で消費する)。
//
// 修正メモ: 以前はここでtimelineManager.pauseAll()も呼んでいたが、
// interrupt()はnotify:trueのsetContext全般(マウス追従によるgaze更新等、
// 高頻度に呼ばれるものも含む)で毎回発火するため、「#interrupt付き選択肢に
// 実際に割り込まれた瞬間」以外の大多数の呼び出しでも演出が毎回一瞬
// pauseされてしまい、gazeのようにnotify経由で頻繁に更新される演出が
// カクつく原因になっていた。pauseAll/resumeAllの呼び出しは、実際に
// #interrupt付き選択肢へ割り込む瞬間(core/useStoryEngine.tsのtick/
// interrupt処理useEffect)側だけに絞った。
export function interrupt(atomKey) {
  pendingInterrupt.set(atomKey, true);
  getBatch(atomKey).controller?.abort();
}
// 呼ぶと同時に「消費」してfalseへ戻す。保留フラグは「次に選択肢が提示される
// この1回」でしか有効ではない(以前からの設計、core/useStoryEngine.tsの
// tick/interrupt処理useEffectのコメント参照)。
export function consumePendingInterrupt(atomKey) {
  const value = pendingInterrupt.get(atomKey) ?? false;
  pendingInterrupt.set(atomKey, false);
  return value;
}
// resetStory()用。進行中の古いバッチがあってもstale扱いにし、以後の
// 待ちも打ち切る。
export function reset(atomKey) {
  const batch = getBatch(atomKey);
  batch.generation += 1;
  batch.controller?.abort();
  pendingInterrupt.set(atomKey, false);
}
export function dispose(atomKey) {
  getBatch(atomKey).controller?.abort();
  batches.delete(atomKey);
  pendingInterrupt.delete(atomKey);
}
//# sourceMappingURL=waitManager.js.map
