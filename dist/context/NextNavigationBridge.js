"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setDefaultOnNavigate } from "../core/defaultNavigate";
// Next.js運用では、アプリのどこか1箇所(例: app/layout.tsxの中の'use client'な
// ラッパー、または各ページ)でこれを1回マウントしておくと、goto:タグが
// router.push()で遷移するようになる。マウントしない場合はlocation.href代入に
// フォールバックする(動きはするが、Next.jsのクライアントサイド遷移にはならない)。
//
// 重要: VNLayerOverlay.tsxやcontext/StoryContext.tsxは、このファイルを
// importしていない。next/navigationへの依存をここ1箇所に閉じ込めることで、
// vnlayer.js(静的バンドル)側は"App Routerが無い"環境でクラッシュしなくなる。
export function NextNavigationBridge() {
    const router = useRouter();
    useEffect(() => {
        setDefaultOnNavigate((path) => router.push(path));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);
    return null;
}
//# sourceMappingURL=NextNavigationBridge.js.map