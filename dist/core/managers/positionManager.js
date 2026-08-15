// キャラの一時的な位置上書き(#s:name:pos:...)を管理するマネージャー。
//
// 設計方針(タグシステム大改修フェーズ3 — 「マネージャー」導入):
// タグ定義ファイル(tags/defs/{basic,special}/*.ts)は、この種の
// マネージャーが公開する関数を「直接import」して呼ぶ。core/useStoryEngine.ts
// は経由しない — useStoryEngine.tsを毎回改修せずにタグを追加できるようにする、
// というのが導入の狙い(handlers.xxx()という間接呼び出しを無くし、
// タグ→マネージャーの直接呼び出しにする)。
//
// マネージャーはReactに依存しない、ただのモジュールスコープの関数群。
// 状態の実体はJotaiのatomFamily(instanceIdごとに独立)。React側
// (core/useStoryEngine.ts)は`useAtomValue(positionOverridesAtomFamily(atomKey))`
// で読むだけで、書き込みはこのマネージャー経由でしか行わない。
import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { getStore } from "../store";
export const positionOverridesAtomFamily = atomFamily((_atomKey) => atom({}));
export function setPos(atomKey, name, coords, durationMs) {
    const store = getStore();
    const target = positionOverridesAtomFamily(atomKey);
    const prev = store.get(target);
    if (coords === "reset") {
        if (!(name in prev))
            return;
        const next = { ...prev };
        delete next[name];
        store.set(target, next);
        return;
    }
    store.set(target, { ...prev, [name]: { ...coords, durationMs } });
}
export function getPositionOverrides(atomKey) {
    return getStore().get(positionOverridesAtomFamily(atomKey));
}
// 簡易セーブ機能(core/SaveProvider.ts)用。保存時点のpositionOverridesを
// そのまま丸ごと置き換える(# s:name:pos:...による一時的な立ち位置移動は
// ink実行状態(state.ToJson())には含まれないため、これを復元しないと
// 「復元直後にキャラや選択肢アンカーの位置がおかしくなる」原因になっていた)。
export function restore(atomKey, overrides) {
    getStore().set(positionOverridesAtomFamily(atomKey), overrides);
}
// resetStory()用。値を空に戻すだけで、atomFamilyのキャッシュからは消さない。
export function reset(atomKey) {
    getStore().set(positionOverridesAtomFamily(atomKey), {});
}
// unmount用。atomFamilyのキャッシュからこのinstanceId分を完全に削除する
// (メモリリーク対策。core/useStoryEngine.tsのunmount時cleanupから呼ばれる)。
export function dispose(atomKey) {
    positionOverridesAtomFamily.remove(atomKey);
}
//# sourceMappingURL=positionManager.js.map