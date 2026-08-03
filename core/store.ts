// Reactコンポーネントの外側(tags/defs/{basic,special}/*.ts、core/managers/*.ts
// のようなタグ定義/マネージャーファイル)からJotaiのatomを読み書きするための
// 共有ストア取得ヘルパー。
//
// StoryProvider側で独自の<Provider store={...}>を用意していない限り、
// Reactの useAtom / useAtomValue 等は暗黙のうちにJotaiの「既定store」を
// 見に行く(jotai v2の仕様)。getDefaultStore()はその既定storeそのものを
// 明示的に取得するAPIなので、これ経由でReactの外側からも同じstoreに
// 触れば、Reactツリー側のuseAtom/useAtomValueと自動的に同期する。
import { getDefaultStore } from "jotai";

export function getStore() {
  return getDefaultStore();
}
