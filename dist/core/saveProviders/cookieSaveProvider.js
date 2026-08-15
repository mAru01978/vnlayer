// 注意: CookieはブラウザによってはUA単位で合計4KB程度までしか保存できない。
// story.state.ToJson()の出力(ink実行状態全体)がストーリーの規模によっては
// そのサイズに収まらないことがある(その場合はsave()が黙って失敗する —
// console.warnは出るが例外は投げない、演出を止めないため)。サイズが心配な
// 場合はcreateLocalStorageSaveProvider、またはサーバー側で保存する
// createServerSaveProviderを使うこと。
export function createCookieSaveProvider(options = {}) {
  const prefix = options.keyPrefix ?? "vnlayer_save_";
  const maxAgeDays = options.maxAgeDays ?? 30;
  function cookieName(key) {
    // Cookie名には使えない記号(コロン等)が混ざりうるので、安全な文字だけに正規化する。
    return `${prefix}${key}`.replace(/[^a-zA-Z0-9_-]/g, "_");
  }
  function readCookie(name) {
    if (typeof document === "undefined") return null;
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
  }
  function writeCookie(name, value) {
    if (typeof document === "undefined") return;
    const maxAge =
      maxAgeDays > 0 ? `; max-age=${maxAgeDays * 24 * 60 * 60}` : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/${maxAge}`;
  }
  function deleteCookie(name) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; path=/; max-age=0`;
  }
  return {
    async save(key, data) {
      try {
        writeCookie(cookieName(key), JSON.stringify(data));
      } catch (e) {
        console.warn(
          "[VNLayer] cookie save failed (likely too large for a cookie):",
          e,
        );
      }
    },
    async load(key) {
      const raw = readCookie(cookieName(key));
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.warn("[VNLayer] cookie save data corrupted, ignoring:", e);
        return null;
      }
    },
    async clear(key) {
      deleteCookie(cookieName(key));
    },
  };
}
//# sourceMappingURL=cookieSaveProvider.js.map
