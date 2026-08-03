// 「1つのatomへの書き込みだけ」で完結するbasicタグ(#cam/#shake/#flash/
// #typeの速度指定部分)専用のatomFamily置き場。
//
// 設計方針(タグシステム大改修フェーズ3): これ以外の状態(bg/characters/
// speaker/positionOverrides/choices/lines/activeMessage/messageWindowHidden
// 等)は、core/managers/ 以下の各マネージャーファイルが「自分の状態として」
// atomFamilyを定義・所有する形に整理した。1ファイルに全部の状態を集める
// のではなく、「そのatomを実際に読み書きする関数群と同じ場所に置く」ことを
// 優先している(状態と、それを操作するロジックを分離しない)。
//
// ここに残っているのは、resolve()から値を計算して書き込むだけで完結する
// (自前の関数群=マネージャーを持つ必要が無い)本当に単純な4つだけ。
//
// atomFamilyのキーはinstanceId相当の文字列(core/useStoryEngine.ts側で、
// instanceId未指定時はuseId()のフォールバック値を使う。詳細はそちらのコメント参照)。
import { atom, type PrimitiveAtom } from "jotai";
import { atomFamily } from "jotai-family";
import { getTagConfig } from "../tags/registry";
import { getStore } from "./store";
import type { TypeConfig } from "../tags/defs/special/type";
import type { CamState, ShakeState } from "./types";

export type FlashState = { color: string; durationMs: number } | null;

function createCamAtom(): PrimitiveAtom<CamState> {
  return atom<CamState>({ target: "", scale: 1, originX: 50, originY: 50 });
}

function createShakeAtom(): PrimitiveAtom<ShakeState> {
  return atom<ShakeState>({ nonce: 0, amplitude: 0, duration: 300 });
}

function createFlashAtom(): PrimitiveAtom<FlashState> {
  return atom(null as FlashState);
}

function createTypeSpeedAtom(): PrimitiveAtom<number> {
  // 初期値はatom生成(=このinstanceKeyでの初回アクセス)時点でgetTagConfigを
  // 引く。VNLayer.configure({ tags: { type: {...} } })でnormal速度が
  // 上書きされていても、その後に最初のuseStoryEngine初期化が走る限りは
  // 反映される。
  return atom<number>(getTagConfig<TypeConfig>("type")?.speeds.normal ?? 30);
}

export const camAtomFamily = atomFamily((_atomKey: string) => createCamAtom());
export const shakeAtomFamily = atomFamily((_atomKey: string) =>
  createShakeAtom(),
);
export const flashAtomFamily = atomFamily((_atomKey: string) =>
  createFlashAtom(),
);
export const typeSpeedAtomFamily = atomFamily((_atomKey: string) =>
  createTypeSpeedAtom(),
);

// cam/shake/flashは専用のマネージャーファイルを持たない(resolve()の中で
// 完結するbasicタグの実体そのものであるため)。resetStory()/unmount時の
// 後片付けだけ、ここにまとめて用意しておく。
export function resetBasicAtoms(atomKey: string): void {
  const store = getStore();
  store.set(camAtomFamily(atomKey), {
    target: "",
    scale: 1,
    originX: 50,
    originY: 50,
  });
  store.set(shakeAtomFamily(atomKey), {
    nonce: 0,
    amplitude: 0,
    duration: 300,
  });
  store.set(flashAtomFamily(atomKey), null);
}

export function disposeBasicAtoms(atomKey: string): void {
  camAtomFamily.remove(atomKey);
  shakeAtomFamily.remove(atomKey);
  flashAtomFamily.remove(atomKey);
}
