// stepProviderと同じパターン: 「onNavigateを明示的に渡さなかった場合の既定値」を
// ここ1箇所で切り替えられるようにする。
//
// 修正前は context/StoryContext.tsx が next/navigation の useRouter() を
// 無条件に呼んでいたため、vnlayer.js(静的バンドル)側でVNLayerOverlayを
// 経由してこのファイルがバンドルされた際、Next.js App Routerが存在しない
// (普通のindex.htmlで読み込んでいる)ため
//   "invariant expected app router to be mounted"
// で即クラッシュしていた。
//
// 対策: next/navigationへの依存はcontext/NextNavigationBridge.tsxだけに閉じ込め、
// context/StoryContext.tsx自体はnext/navigationを一切importしない形にした。
// Next.js運用では、アプリのどこか(通常はlayout.tsx配下)で
// <NextNavigationBridge /> を1回マウントしてもらうことで、
// setDefaultOnNavigate(path => router.push(path)) が登録される。
// 何も登録されていない場合(=静的運用時など)は location.href を使う。

export type NavigateFn = (path: string) => void;

let current: NavigateFn = (path: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = path;
  } else {
    console.warn('[VNLayer] onNavigate fallback called in a non-browser environment:', path);
  }
};

export function setDefaultOnNavigate(fn: NavigateFn): void {
  current = fn;
}

export function getDefaultOnNavigate(): NavigateFn {
  return current;
}
