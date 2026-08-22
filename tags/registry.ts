// タグごとに「設定値(config)」と「処理内容(run)」を1ファイルにまとめて登録する仕組み。
// scripts/new-tag.js が今後 tags/defs/special/<タグ名>.ts を1個生成するだけで済むようにする狙い。
//
// VNLayer.configure({ tags: { cam: { scales: {...} } } }, selector?) のように、
// Next.js側からもvnlayer.js(静的バンドル)側からも同じsetTagConfig経由で
// 上書きできる。
//
// scope対応(2.1: configureスコープ統一): 以前はレジストリ全体で1つのconfig
// オブジェクトを共有していた(常にグローバル)。今はdefaultConfigを持つタグ
// だけ、tags/scopedStore.tsのScopedStoreを持ち、setTagConfig(key, partial,
// scope?)でVNインスタンス単位に上書きできる。config自体の解決(getTagConfig
// 相当)はruntTag()実行のたびにhandlers.instanceId(公開スコープ識別子)を
// 見て都度行う(以前は登録時に固定した1個のオブジェクトを全VNで共有していた)。
//
// 識別子が2種類あることに注意:
//   atomKey    … Jotaiのatom隔離用キー。instanceId未指定時はcore/
//                useStoryEngine.ts側がuseId()で生成したフォールバック値を
//                使うため、必ず一意になる。bg/characters/positionOverrides
//                等「このVNインスタンス自身の状態」を読み書きするマネージャー
//                関数は、ほぼ全てこちらを使う。
//   instanceId … mount()時に渡した公開スコープ識別子(選択セレクタ)。
//                未指定(undefined)は「グローバル/全VN共通」という意味を
//                持つ場面(tags/uiConfig.tsのスコープ判定、タグconfigの
//                スコープ判定、全VN共通バックログのmode判定、#emit/
//                #web:emitの宛先・送信元表示)で使う。atomKeyと違い、
//                名無しインスタンス同士が同じundefinedを共有するのが意図通り。
export type TagHandlers = {
  atomKey: string;
  instanceId?: string;
};

import type { PrimitiveAtom } from "jotai";
import { getStore } from "../core/store";
import * as waitManager from "../core/managers/waitManager";
import { reportError, TagDispatchError } from "../core/errors";
import { createScopedStore, type ScopedStore } from "./scopedStore";

export type TagRunContext<TConfig> = {
  args: string[];
  handlers: TagHandlers;
  config: TConfig;
};

export type TagDefinition<TConfig = any> = {
  key: string;
  // 省略した場合、このタグは設定を持たない(bg/gaze/shake/web等)
  defaultConfig?: TConfig;
  run: (ctx: TagRunContext<TConfig>) => Promise<void> | void;
};

type RegistryEntry = {
  def: TagDefinition;
  // defaultConfigを持つタグだけ非null。configStore.get(scope)がその都度
  // 実効値を返す(scope省略時はグローバルのみ)。
  configStore: ScopedStore<Record<string, unknown>, unknown> | null;
};

const registry = new Map<string, RegistryEntry>();

export function registerTag<TConfig>(def: TagDefinition<TConfig>): void {
  const configStore =
    def.defaultConfig !== undefined
      ? createScopedStore<Record<string, unknown>, unknown>({
          defaultValue: { ...(def.defaultConfig as object) },
          mergePatch: (base, patch) =>
            patch ? { ...(base as object), ...patch } : base,
          mergePatches: (prev, patch) => ({ ...(prev ?? {}), ...patch }),
        })
      : null;
  registry.set(def.key, { def, configStore });
}

// タグの短縮エイリアスを登録する(例: registerAlias('c', 'cam'))。
// エイリアス側もsetTagConfig/getTagConfigで同じ実体(RegistryEntry)を
// 共有するので、設定の上書きはどちらの名前でアクセスしても一致する。
// 頭文字が他のタグと衝突する場合は登録しない(例: #s は既にspeaker/sprite用
// タグそのものなので、他のタグに's'エイリアスを与えることはできない)。
export function registerAlias(alias: string, canonicalKey: string): void {
  const entry = registry.get(canonicalKey);
  if (!entry) {
    console.warn(
      `[VNLayer] registerAlias: unknown canonical tag "${canonicalKey}" for alias "${alias}"`,
    );
    return;
  }
  if (registry.has(alias)) {
    console.warn(
      `[VNLayer] registerAlias: alias "${alias}" is already taken, skipping`,
    );
    return;
  }
  registry.set(alias, entry);
}

// 既存タグの設定を部分的に上書きする(浅いマージ)。scopeを省略すると今まで
// 通り全VN共通(グローバル)、指定するとそのVNインスタンスだけの上書きになる
// (グローバル設定はそのまま、他のVNには影響しない)。
export function setTagConfig(
  key: string,
  partial: Record<string, unknown>,
  scope?: string,
): void {
  const entry = registry.get(key);
  if (!entry) {
    console.warn(`[VNLayer] setTagConfig: unknown tag "${key}"`);
    return;
  }
  if (!entry.configStore) {
    console.warn(
      `[VNLayer] setTagConfig: tag "${key}" has no defaultConfig, ignoring`,
    );
    return;
  }
  entry.configStore.set(partial, scope);
}

export function getTagConfig<T = any>(key: string, scope?: string): T | undefined {
  return registry.get(key)?.configStore?.get(scope) as T | undefined;
}

// 「認識できるキーだが引数が不正/未対応」の場合の共通警告。以前は各タグが
// handlers.onUnknownTag?.(...)経由で呼んでいたが、これも「状態を書き換える」
// わけではない単なる診断出力なので、handlersから外して直接importできる
// 関数にした。
// 修正メモ: 以前はconsole.warn直書きだったが、core/errors.tsのエラー型
// 階層に寄せた(TagDispatchError)。多くのタグ定義ファイルがこの関数を
// 経由して不正な引数を報告しているため、ここを直すだけで横断的に
// 「タグの引数エラー」がVNLayerError系として一貫した形で報告されるようになる。
export function warnUnknownTag(tag: string): void {
  throw new TagDispatchError(`unknown tag or invalid arguments: ${tag}`);
}

export async function runTag(
  key: string,
  args: string[],
  handlers: TagHandlers,
): Promise<void> {
  const entry = registry.get(key);
  if (!entry) {
    warnUnknownTag(key);
    return;
  }
  // configはこの呼び出し時点で、handlers.instanceId(公開スコープ識別子)を
  // 見て都度解決する(2.1: configureスコープ統一。以前は登録時に固定した
  // 1個のオブジェクトを全VNで共有していた)。defaultConfigを持たないタグ
  // (configStoreがnull)ではundefinedのまま(元々run()側の型もconfig省略可な
  // 作りなので影響しない)。
  const config = entry.configStore?.get(handlers.instanceId);
  await entry.def.run({ args, handlers, config });
}

// --- タグシステム大改修(Jotai導入)フェーズ1〜3: basicタグ用の宣言的API ---
//
// 「ラベル→値の解決 → 1つのatomへ書き込む(必要ならその後少し待つ/しばらくして
// 元に戻す)」だけで完結するタグ向け。このAPIで作ったタグは、useStoryEngine.ts
// に一切手を入れる必要が無い。
//
// basicタグの実体は tags/defs/basic/ 、複雑な分岐や複数箇所への副作用を
// 持つタグ(#s/#anim/#ui/#web/#emit/#bg/#wait/#type等)は今まで通り
// registerTag({run:...})を使い、tags/defs/special/ に置く
// (ただしspecial側もcore/useStoryEngine.tsは経由せず、core/managers/の
// 各マネージャーを直接呼ぶ設計にした。「special」は「useStoryEngineに
// 書く」という意味ではない)。
export type BasicTagRunHelpers = {
  atomKey: string;
  instanceId?: string;
  // Reactの外からatomを読み書きするための共有store(core/store.ts参照)。
  // #cam のように「他のatom(positionOverrides等)や自分自身の現在値を見てから
  // 次の値を決めたい」タグは、ここから store.get(...) して参照できる。
  store: ReturnType<typeof getStore>;
};

export type BasicTagDefinition<TConfig, TValue> = {
  key: string;
  defaultConfig?: TConfig;
  // このタグが書き込む先のatomFamily(atomKeyを渡すとそのVNインスタンス
  // 専用のatomを返す関数。core/atoms.ts、または各マネージャーが公開する
  // atomFamilyを渡す)。
  atomFamily: (atomKey: string) => PrimitiveAtom<TValue>;
  // argsとconfig(と必要ならhelpers経由で他atomの現在値)から書き込む値を
  // 決定する。undefinedを返すと何もしない(ラベルが存在しない等、無効な
  // 指定を無視する既存タグ群と同じ振る舞い)。
  resolve: (
    args: string[],
    config: TConfig,
    helpers: BasicTagRunHelpers,
  ) => TValue | undefined;
  // 値を書き込んだ直後に待つ時間(ms)。#cam のように、演出のdurationぶん
  // 待ってから次のタグ/文章へ進みたいタグ向け。省略時は待たない。
  // core/managers/waitManager.tsを経由するので、notify()による即時打ち切り
  // (interrupt)の対象になる。
  resolveWaitMs?: (args: string[], config: TConfig) => number | undefined;
  // 書き込んだ値を、指定msぶん経過後に自動で`clearValue`へ戻したい場合の
  // 遅延(ms)。#flash のように「表示→しばらくして自動で消える」タグ向け。
  // ストーリー進行はブロックしない(setTimeoutのfire-and-forget)。
  resolveClearAfterMs?: (args: string[], config: TConfig) => number | undefined;
  // resolveClearAfterMs使用時に戻す値(通常はnullや初期値)。
  clearValue?: TValue;
};

export function registerBasicTag<TConfig, TValue>(
  def: BasicTagDefinition<TConfig, TValue>,
): void {
  registerTag<TConfig>({
    key: def.key,
    defaultConfig: def.defaultConfig,
    run: async ({ args, config, handlers }) => {
      const store = getStore();
      const targetAtom = def.atomFamily(handlers.atomKey);
      const value = def.resolve(args, config, {
        atomKey: handlers.atomKey,
        instanceId: handlers.instanceId,
        store,
      });
      if (value === undefined) return;
      store.set(targetAtom, value);

      const waitMs = def.resolveWaitMs?.(args, config);
      if (waitMs) {
        await waitManager.wait(handlers.atomKey, waitMs);
      }

      const clearAfterMs = def.resolveClearAfterMs?.(args, config);
      if (clearAfterMs !== undefined && def.clearValue !== undefined) {
        setTimeout(
          () => store.set(targetAtom, def.clearValue as TValue),
          clearAfterMs,
        );
      }
    },
  });
}
