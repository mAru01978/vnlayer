import type { SaveProvider, SaveData } from '../SaveProvider';

// 既定のSaveProvider。VNLayer.mount()/<VNLayer>で明示的にsaveProviderを
// 指定しなかった場合、core/defaultSaveProvider.ts経由でこれが使われる
// (静的実行(staticStepProvider)と組み合わせた「素材+inkだけで動く」運用の
// 既定として、追加のサーバーを必要としないlocalStorageを選んでいる)。
export type LocalStorageSaveProviderOptions = {
  // 既定は "vnlayer:save:"。同一オリジンで複数のVNLayerアプリを動かす場合の
  // キー衝突回避用。
  keyPrefix?: string;
};

export function createLocalStorageSaveProvider(
  options: LocalStorageSaveProviderOptions = {},
): SaveProvider {
  const prefix = options.keyPrefix ?? 'vnlayer:save:';

  function storageKey(key: string): string {
    return `${prefix}${key}`;
  }

  function hasStorage(): boolean {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
      // Safariのプライベートブラウズ等、localStorageへのアクセス自体が
      // 例外を投げる環境がある。
      return false;
    }
  }

  return {
    async save(key, data) {
      if (!hasStorage()) return;
      try {
        window.localStorage.setItem(storageKey(key), JSON.stringify(data));
      } catch (e) {
        console.warn('[VNLayer] localStorage save failed (quota exceeded, or private mode?):', e);
      }
    },
    async load(key) {
      if (!hasStorage()) return null;
      const raw = window.localStorage.getItem(storageKey(key));
      if (!raw) return null;
      try {
        return JSON.parse(raw) as SaveData;
      } catch (e) {
        console.warn('[VNLayer] localStorage save data corrupted, ignoring:', e);
        return null;
      }
    },
    async clear(key) {
      if (!hasStorage()) return;
      window.localStorage.removeItem(storageKey(key));
    },
  };
}
