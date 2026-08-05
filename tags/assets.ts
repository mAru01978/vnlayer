// bg/sprite/animの3つの「素材解決」(#bg/#s/#anim が実際に何を表示するかを
// 決める仕組み)で共通して使う、汎用の登録・解決ヘルパー。
//
// 3つとも同じ形の要求を持つ:
//   - VNLayer.configure({...})やink側のタグから、キー→設定値の対応表を
//     登録できる(characterSlots.ts/backgroundSlots.tsと同じ「後から書いた
//     方が勝つ」共有ストアパターン)。
//   - それだけでなく、「命名規則さえ守ればファイルを1個ずつ登録しなくても
//     自動で解決できる」ようにしたいケースもある(例: キャラ名から
//     `/assets/characters/${name}/${expression}.webp` を機械的に組み立てる等)。
//     これを「カスタムresolver」として登録できるようにしてある。
// テーブル登録(set)とカスタムresolver(setResolver)は両方使えて、
// テーブルに無ければresolverにフォールバックする。
export type AssetRegistry<TConfig> = {
  set: (patch: Record<string, TConfig>) => void;
  setResolver: (fn: (key: string) => TConfig | undefined) => void;
  get: (key: string) => TConfig | undefined;
  getAll: () => Record<string, TConfig>;
};

export function createAssetRegistry<TConfig>(): AssetRegistry<TConfig> {
  let table: Record<string, TConfig> = {};
  let resolver: ((key: string) => TConfig | undefined) | undefined;

  return {
    set(patch) {
      table = { ...table, ...patch };
    },
    setResolver(fn) {
      resolver = fn;
    },
    get(key) {
      return table[key] ?? resolver?.(key);
    },
    getAll() {
      return table;
    },
  };
}
