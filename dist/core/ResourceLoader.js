import { ResourceLoadError, reportError } from "./errors";
function joinPath(basePath, path) {
  if (!basePath) return path;
  const trimmedBase = basePath.replace(/\/+$/, "");
  const trimmedPath = path.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
}
// story.json等、JSONとして読み込みたいリソース用。
export async function loadJson(path, options = {}) {
  const fullPath = joinPath(options.basePath, path);
  const source = options.source ?? "fetch";
  if (source === "local") {
    if (!options.resolveLocal) {
      throw new ResourceLoadError(
        `source:'local' requires resolveLocal to be provided (path: "${fullPath}")`,
      );
    }
    try {
      return await options.resolveLocal(fullPath);
    } catch (e) {
      throw new ResourceLoadError(`resolveLocal failed for "${fullPath}"`, {
        cause: e,
      });
    }
  }
  let res;
  try {
    res = await fetch(fullPath);
  } catch (e) {
    throw new ResourceLoadError(`fetch failed for "${fullPath}"`, { cause: e });
  }
  if (!res.ok) {
    throw new ResourceLoadError(`failed to fetch "${fullPath}": ${res.status}`);
  }
  return res.json();
}
// 画像/動画のsrcとして使うURL文字列を解決する用。fetch方式では単に
// パスを組み立てるだけ(実際のバイト取得はブラウザの<img>/<video>タグに
// 任せる)。local方式ではresolveLocal(path)がURL文字列(blob: URL等)を
// 返す前提。
export async function resolveUrl(path, options = {}) {
  const fullPath = joinPath(options.basePath, path);
  const source = options.source ?? "fetch";
  if (source === "local") {
    if (!options.resolveLocal) {
      throw new ResourceLoadError(
        `source:'local' requires resolveLocal to be provided (path: "${fullPath}")`,
      );
    }
    try {
      const resolved = await options.resolveLocal(fullPath);
      if (typeof resolved !== "string") {
        throw new ResourceLoadError(
          `resolveLocal must return a URL string for resolveUrl() (path: "${fullPath}")`,
        );
      }
      return resolved;
    } catch (e) {
      if (e instanceof ResourceLoadError) throw e;
      throw new ResourceLoadError(`resolveLocal failed for "${fullPath}"`, {
        cause: e,
      });
    }
  }
  return fullPath;
}
// --- 素材(sprite/anim)向け: キャッシュ付き非同期URL解決 ---
//
// resolveUrl()自体は毎回呼べば動くが、source:'local'の場合は
// resolveLocal()が非同期(Promise)であるのに対し、components/Renderer.tsx
// 側のレンダリングは同期的(Reactのレンダー関数はawaitできない)。
// そのため「未解決の間はundefinedを返しつつ裏で解決を進め、解決できたら
// キャッシュに積んでコールバックで再描画を促す」という形にしている。
// tags/spriteAssets.ts・tags/animAssets.ts両方から共有して使う
// (同じ仕組みを2箇所に重複実装しないため)。
const resolvedUrlCache = new Map();
const pendingResolutions = new Map();
export function resolveUrlCached(cacheKey, path, options, onResolved) {
  const cached = resolvedUrlCache.get(cacheKey);
  if (cached !== undefined) return cached;
  if (!pendingResolutions.has(cacheKey)) {
    const pending = resolveUrl(path, options)
      .then((url) => {
        resolvedUrlCache.set(cacheKey, url);
        onResolved();
      })
      .catch((e) => {
        reportError(
          e instanceof ResourceLoadError
            ? e
            : new ResourceLoadError(`failed to resolve asset "${path}"`, {
                cause: e,
              }),
        );
      })
      .finally(() => {
        pendingResolutions.delete(cacheKey);
      });
    pendingResolutions.set(cacheKey, pending);
  }
  return undefined;
}
// 素材レジストリのclear/リセット等で古いキャッシュを捨てたい場合用
// (通常は不要 — 同じcacheKeyなら同じ結果になるはずなので、基本的には
// 溜まったままで問題ない)。
export function clearResolvedUrlCache(cacheKeyPrefix) {
  if (!cacheKeyPrefix) {
    resolvedUrlCache.clear();
    return;
  }
  for (const key of Array.from(resolvedUrlCache.keys())) {
    if (key.startsWith(cacheKeyPrefix)) resolvedUrlCache.delete(key);
  }
}
//# sourceMappingURL=ResourceLoader.js.map
