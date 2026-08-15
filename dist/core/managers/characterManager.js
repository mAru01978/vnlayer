// キャラクター表示状態(表情/アニメーション/視線/表示・非表示)を管理する
// マネージャー。#s(sprite)/#anim/#gaze タグから呼ばれる。
//
// hideCharacter()だけはautoHideOnCharHideの判定(tags/uiConfig.tsの実効
// 設定、instanceIdスコープ)が絡むため、他の関数と違いatomKeyに加えて
// instanceId(公開スコープ識別子)も受け取る。
import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { getStore } from "../store";
import { getUiConfig } from "../../tags/uiConfig";
import * as messageManager from "./messageManager";
export const charactersAtomFamily = atomFamily((_atomKey) => atom({}));
function update(atomKey, updater) {
    const store = getStore();
    const target = charactersAtomFamily(atomKey);
    store.set(target, updater(store.get(target)));
}
export function setExpression(atomKey, name, expression) {
    update(atomKey, (prev) => ({ ...prev, [name]: { expression } }));
}
export function setAnimMotion(atomKey, name, motion) {
    update(atomKey, (prev) => ({
        ...prev,
        [name]: {
            expression: prev[name]?.expression ?? "normal",
            motion,
            // 普通のanim:はループ/逆再生をリセットした「素の」モーション再生として扱う。
            // 再生速度(animSpeed)はキャラ単位の持続設定なので維持する。
            animLoop: false,
            animReverse: false,
            animSpeed: prev[name]?.animSpeed,
        },
    }));
}
export function setAnimLoop(atomKey, name, motion) {
    update(atomKey, (prev) => ({
        ...prev,
        [name]: {
            ...prev[name],
            expression: prev[name]?.expression ?? "normal",
            motion,
            animLoop: true,
            animReverse: false,
        },
    }));
}
export function setAnimStop(atomKey, name) {
    update(atomKey, (prev) => {
        if (!prev[name])
            return prev;
        return {
            ...prev,
            [name]: {
                ...prev[name],
                motion: undefined,
                animLoop: false,
                animReverse: false,
            },
        };
    });
}
export function setAnimSpeed(atomKey, name, speed) {
    update(atomKey, (prev) => ({
        ...prev,
        [name]: {
            ...prev[name],
            expression: prev[name]?.expression ?? "normal",
            animSpeed: speed,
        },
    }));
}
export function setAnimReverse(atomKey, name, motion) {
    update(atomKey, (prev) => ({
        ...prev,
        [name]: {
            ...prev[name],
            expression: prev[name]?.expression ?? "normal",
            motion,
            animReverse: true,
        },
    }));
}
export function setGaze(atomKey, name, target) {
    update(atomKey, (prev) => {
        if (!prev[name] && target === "reset")
            return prev;
        const { gaze: _drop, ...rest } = prev[name] ?? { expression: "normal" };
        return {
            ...prev,
            [name]: target === "reset" ? rest : { ...rest, gaze: target },
        };
    });
}
export function hideCharacter(atomKey, instanceId, name) {
    update(atomKey, (prev) => {
        if (!(name in prev))
            return prev;
        const next = { ...prev };
        delete next[name];
        return next;
    });
    // 修正メモ: 話者が#s:name:hideで非表示になっても、以前はメッセージ
    // ウィンドウ(吹き出し)がそのまま画面に残り続けていた
    // (「キャラがいなくなっても残っちゃう」不自然さの原因)。
    // #ui:messageWindow:autoHideOnCharHide(既定on)で自動フェードアウトする。
    if (getUiConfig(instanceId).messageWindow.autoHideOnCharHide) {
        messageManager.clearIfSpeakerIs(atomKey, name);
    }
}
export function getCharacters(atomKey) {
    return getStore().get(charactersAtomFamily(atomKey));
}
// core/useStoryEngine.tsのadvance()末尾、ink側の蓄積スナップショット
// (result.visual.characters)との同期専用。
//
// 重要: result.visual.characters は inkStepRunner.ts側が独自に追跡してる
// 「bg/表情/モーション等の永続化用スナップショット」で、gazeはそもそも
// 追跡対象に含まれていない(モック確認用の一時的な見た目情報として
// 扱われていたため)。ここでそのまま丸ごと上書きすると、直前にgazeタグで
// 設定したばかりの視線が同じバッチの中で即座に上書き・消去されてしまう
// (「一瞬表示されてすぐ消える」の原因だった)。gazeだけは現在のstateから
// 引き継ぐ。
export function mergeVisualSnapshot(atomKey, visualCharacters) {
    update(atomKey, (prev) => {
        const merged = {};
        for (const [name, charState] of Object.entries(visualCharacters)) {
            merged[name] = { ...charState, gaze: prev[name]?.gaze };
        }
        return merged;
    });
}
export function reset(atomKey) {
    getStore().set(charactersAtomFamily(atomKey), {});
}
export function dispose(atomKey) {
    charactersAtomFamily.remove(atomKey);
}
//# sourceMappingURL=characterManager.js.map