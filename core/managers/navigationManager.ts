// #web:goto によるページ遷移の「予約」を管理するマネージャー。
//
// 実際のonNavigate(path)呼び出しはcore/useStoryEngine.tsのadvance()が
// 1バッチ(=タグ処理のまとまり)の最後にまとめて行う(ink側がgotoの後にも
// まだ文章/タグを続けて出す可能性があるため、即座に遷移せず「予約だけ
// しておいて、バッチの終わりに実行する」という以前からの設計を踏襲)。
// このマネージャーはその「予約」の置き場所を提供するだけで、実行タイミングの
// 判断(バッチの終わり)自体はink進行ループの責務としてuseStoryEngine.ts側に残す。
const pendingGoto = new Map<string, string>();

export function requestGoto(atomKey: string, path: string): void {
  pendingGoto.set(atomKey, path);
}

// 呼ぶと同時に「消費」して予約を消す。
export function consumePendingGoto(atomKey: string): string | undefined {
  const path = pendingGoto.get(atomKey);
  pendingGoto.delete(atomKey);
  return path;
}

export function reset(atomKey: string): void {
  pendingGoto.delete(atomKey);
}

export function dispose(atomKey: string): void {
  pendingGoto.delete(atomKey);
}
