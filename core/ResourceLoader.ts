import { ResourceLoadError, reportError } from "./errors";

// story.json(ink)とsprite/anim素材、両方から使う共通のリソース取得口。
// Next.js等の一部バンドラー環境では「fetchはpublicフォルダに置いたものしか
// 取れない」という制約があり不便なため、取得方法を2種類から選べるようにする:
//
//   source: 'fetch' (既定) … 通常のfetch(url)経由。CDN配信やpublicフォルダ
//                            配置の素材/ink成果物を想定。
//   source: 'local'        … resolveLocal(path)という利用側が渡す関数経由。
//                            バンドラーのimport()/require()等で解決した
//                            実データ(story.json用)やURL(画像/動画の
//                            src用、blob: URL等)を返す想定。VNLayer自身は
//                            バンドラー固有の解決方法を知らないため、
//                            「pathを受け取って何かを返す関数」を渡して
//                            もらうだけの薄いフックにしてある。
//
// ink(StaticStepProviderOptions)側・素材(assets設定)側、どちらも同じ
// この関数を経由するので、取得方法の切り替えロジックが重複しない。
export type ResourceSource = "local" | "fetch";
export type ResourceLoaderOptions = {
  source?: ResourceSource;
  // 素材/story.jsonの配信ベースパス。指定した場合、pathの前に
  // `${basePath}/`を付けて解決する。
  basePath?: string;
  // source:'local'の時に必須。pathを受け取り、実データ(JSON等、
  // loadJson用)またはURL文字列(画像/動画のsrc等、resolveUrl用)を返す。
  resolveLocal?: (path: string) => Promise<unknown>;
};

function joinPath(basePath: string | undefined, path: string): string {
  if (!basePath) return path;
  const trimmedBase = basePath.replace(/\/+$/, "");
  const trimmedPath = path.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
}

// story.json等、JSONとして読み込みたいリソース用。
export async function loadJson<T>(
  path: string,
  options: ResourceLoaderOptions = {},
): Promise<T> {
  const fullPath = joinPath(options.basePath, path);
  const source = options.source ?? "fetch";

  if (source === "local") {
    if (!options.resolveLocal) {
      throw new ResourceLoadError(
        `source:'local' requires resolveLocal to be provided (path: "${fullPath}")`,
      );
    }
    try {
      return (await options.resolveLocal(fullPath)) as T;
    } catch (e) {
      throw new ResourceLoadError(`resolveLocal failed for "${fullPath}"`, {
        cause: e,
      });
    }
  }

  let res: Response;
  try {
    res = await fetch(fullPath);
  } catch (e) {
    throw new ResourceLoadError(`fetch failed for "${fullPath}"`, { cause: e });
  }
  if (!res.ok) {
    throw new ResourceLoadError(`failed to fetch "${fullPath}": ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// 画像/動画のsrcとして使うURL文字列を解決する用。fetch方式では単に
// パスを組み立てるだけ(実際のバイト取得はブラウザの<img>/<video>タグに
// 任せる)。local方式ではresolveLocal(path)がURL文字列(blob: URL等)を
// 返す前提。
export async function resolveUrl(
  path: string,
  options: ResourceLoaderOptions = {},
): Promise<string> {
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
const resolvedUrlCache = new Map<string, string>();
const pendingResolutions = new Map<string, Promise<void>>();

export function resolveUrlCached(
  cacheKey: string,
  path: string,
  options: ResourceLoaderOptions,
  onResolved: () => void,
): string | undefined {
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

// 素材レジストリのclear/リセット等で古いキャッシュを捨てたい場合用。
// (通常は不要 — 同じcacheKeyなら同じ結果になるはずなので、基本的には
// 溜まったままで問題ない)。
export function clearResolvedUrlCache(cacheKeyPrefix?: string): void {
  if (!cacheKeyPrefix) {
    resolvedUrlCache.clear();
    return;
  }
  for (const key of Array.from(resolvedUrlCache.keys())) {
    if (key.startsWith(cacheKeyPrefix)) resolvedUrlCache.delete(key);
  }
}
