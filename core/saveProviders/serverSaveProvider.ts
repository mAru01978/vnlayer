import type { SaveProvider, SaveData } from '../SaveProvider';

export type ServerSaveProviderOptions = {
  // 既定は "/api/save"。以下の単純なREST規約を想定する(実際のAPI Route
  // 実装はホストアプリ側で用意すること):
  //   GET    {endpoint}?key=<key>  → { data: SaveData | null }
  //   POST   {endpoint}            → body: { key, data: SaveData }
  //   DELETE {endpoint}?key=<key>  → セーブ削除
  endpoint?: string;
};

// 自前のサーバー/DBに保存したい場合用。cookieセッション方式のサーバー
// 実行(serverStepProvider)と組み合わせるかどうかは任意 — staticStepProvider
// (ブラウザ内実行)と組み合わせて「実行はブラウザ、セーブだけサーバーに
// predict保存する」という構成も可能。
export function createServerSaveProvider(
  options: ServerSaveProviderOptions = {},
): SaveProvider {
  const endpoint = options.endpoint ?? '/api/save';

  return {
    async save(key, data) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key, data }),
      });
      if (!res.ok) {
        console.warn(`[VNLayer] server save failed: ${res.status}`);
      }
    },
    async load(key) {
      const res = await fetch(`${endpoint}?key=${encodeURIComponent(key)}`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      try {
        const json = await res.json();
        return (json?.data ?? null) as SaveData | null;
      } catch {
        return null;
      }
    },
    async clear(key) {
      await fetch(`${endpoint}?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    },
  };
}
