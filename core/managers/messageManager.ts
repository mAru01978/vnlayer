// メッセージウィンドウ(吹き出し・ナレーションキャプション)の表示内容を
// 管理するマネージャー。#ui:messageWindow:... タグ、core/useStoryEngine.tsの
// advance()(文章行を表示する箇所)、characterManager(autoHideOnCharHide)、
// backgroundManager(autoHideOnBgChange)から呼ばれる。
//
// 以前はcore/useStoryEngine.ts内のtransientTimerRef(setTimeoutの
// キャンセル用ref)として持っていた「一定時間で自動的に消す」タイマーを、
// atomKeyごとのMapとしてこちら側に持たせた。
import { atom, type PrimitiveAtom } from "jotai";
import { atomFamily } from "jotai-family";
import { getStore } from "../store";
import type { ActiveMessage } from "../types";

export const activeMessageAtomFamily = atomFamily(
  (_atomKey: string) =>
    atom<ActiveMessage | null>(null) as PrimitiveAtom<ActiveMessage | null>,
);
// #ui:messageWindow:fade:in で立てるフラグ。次に表示するメッセージだけに
// 効く「消費されたら戻る」性質のため、Reactの再描画に載せる必要が薄く
// atomではなくMapで十分(以前はuseStoryEngine.ts内のuseRefだった)。
const nextRevealFade = new Map<string, boolean>();
const transientTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearTransientTimer(atomKey: string): void {
  const timer = transientTimers.get(atomKey);
  if (timer) {
    clearTimeout(timer);
    transientTimers.delete(atomKey);
  }
}

export function setNextRevealFade(atomKey: string, fadeIn: boolean): void {
  nextRevealFade.set(atomKey, fadeIn);
}

// 呼ぶと同時に「消費」してfalseへ戻す(1回のメッセージ表示にだけ効く)。
function consumeNextRevealFade(atomKey: string): boolean {
  const value = nextRevealFade.get(atomKey) ?? false;
  nextRevealFade.set(atomKey, false);
  return value;
}

// core/useStoryEngine.tsのadvance()が、文章を伴う行を処理するたびに呼ぶ。
export function showMessage(
  atomKey: string,
  speaker: string,
  content: string,
  typeSpeedMs: number,
): void {
  clearTransientTimer(atomKey);
  const fadeIn = consumeNextRevealFade(atomKey);
  getStore().set(activeMessageAtomFamily(atomKey), {
    speaker,
    content,
    fadeIn,
    typeSpeedMs,
    // 通常表示は常にタイプライターアニメーションから始める
    // (startRevealedは簡易セーブ復元専用のフラグなのでここでは付けない)。
    startRevealed: false,
  });
}

// 簡易セーブ機能(core/SaveProvider.ts)の復元専用。保存時点のactiveMessageを
// そのまま書き戻す。startRevealedは呼び出し側(core/useStoryEngine.ts)が
// 「保存時点で#type:wait:onにより表示が完了していたか」を判定して渡す
// (components/StageView.tsx側がこのフラグを見てタイプライター演出の
// スキップ可否を決める)。
export function restoreMessage(atomKey: string, message: ActiveMessage): void {
  clearTransientTimer(atomKey);
  getStore().set(activeMessageAtomFamily(atomKey), message);
}

// #ui:messageWindow:mode:hide/transient/persist 用。
export function setMode(
  atomKey: string,
  mode: "transient" | "persist" | "hide",
  transientDurationMs?: number,
): void {
  if (mode === "hide") {
    clearTransientTimer(atomKey);
    getStore().set(activeMessageAtomFamily(atomKey), null);
    return;
  }
  if (mode === "transient") {
    clearTransientTimer(atomKey);
    const timer = setTimeout(() => {
      getStore().set(activeMessageAtomFamily(atomKey), null);
    }, transientDurationMs ?? 4000);
    transientTimers.set(atomKey, timer);
    return;
  }
  clearTransientTimer(atomKey);
}

// 現在のメッセージを無条件でクリアする(backgroundManagerのautoHideOnBgChange用)。
export function clear(atomKey: string): void {
  clearTransientTimer(atomKey);
  getStore().set(activeMessageAtomFamily(atomKey), null);
}

// 現在のメッセージの話者が指定した名前の時だけクリアする
// (characterManagerのautoHideOnCharHide用。他のキャラの発言中に無関係な
// hideが発生してもクリアしない)。
export function clearIfSpeakerIs(atomKey: string, name: string): void {
  const store = getStore();
  const target = activeMessageAtomFamily(atomKey);
  const current = store.get(target);
  if (current && current.speaker === name) {
    clearTransientTimer(atomKey);
    store.set(target, null);
  }
}

export function getActiveMessage(atomKey: string): ActiveMessage | null {
  return getStore().get(activeMessageAtomFamily(atomKey));
}

export function reset(atomKey: string): void {
  clearTransientTimer(atomKey);
  nextRevealFade.delete(atomKey);
  getStore().set(activeMessageAtomFamily(atomKey), null);
}

export function dispose(atomKey: string): void {
  clearTransientTimer(atomKey);
  nextRevealFade.delete(atomKey);
  activeMessageAtomFamily.remove(atomKey);
}
