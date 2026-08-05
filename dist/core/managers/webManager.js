// #web:open / #web:scroll / #web:emit が行う、ブラウザ側への直接的な
// 副作用をまとめたマネージャー。状態(atom)は一切持たない、純粋な
// side-effect関数群(ネイティブDOM API呼び出しのラッパー)。
import { resolveDomSelectorToken } from "../../tags/domSelector";
export function openUrl(url) {
    if (typeof window === "undefined")
        return;
    window.open(url, "_blank", "noopener,noreferrer");
}
export function scrollTo(target, durationMs) {
    if (typeof window === "undefined" || typeof document === "undefined")
        return;
    const n = Number(target);
    let targetY;
    if (Number.isFinite(n) && target.trim() !== "") {
        targetY = n;
    }
    else {
        // 修正メモ: targetがCSSセレクタとして不正な文字列(スペースを含む、
        // 記号始まり等)だと document.querySelector が同期的に例外を投げる。
        // #web:scrollのtargetはシナリオ制作者が手で書くink側の文字列なので、
        // タイポ等で不正な値が来ても演出全体を巻き込んで止めないよう、
        // ここで例外を吸収する。
        let el = null;
        try {
            el = document.querySelector(resolveDomSelectorToken(target));
        }
        catch (e) {
            console.warn(`[VNLayer] web:scroll: invalid selector/target "${target}", ignoring:`, e);
        }
        if (el)
            targetY = window.scrollY + el.getBoundingClientRect().top;
    }
    if (targetY === undefined)
        return;
    if (!durationMs) {
        window.scrollTo({ top: targetY, behavior: "smooth" });
        return;
    }
    // ブラウザ既定のsmoothスクロールには時間指定が無いため、durationMs指定時
    // だけ自前でrequestAnimationFrameアニメーションする。
    const startY = window.scrollY;
    const distance = targetY - startY;
    const start = performance.now();
    const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const step = (now) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / durationMs, 1);
        window.scrollTo(0, startY + distance * easeInOutQuad(t));
        if (t < 1)
            requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}
// #web:emit:eventName:value 用。ink変数(setContext/getContext)を一切経由
// せず、window.dispatchEventで直接ブラウザ側へ通知する(ink→webへの
// 一方通行の唯一の出口)。host側はwindow.addEventListenerで"vnlayer:emit"を
// 購読し、e.detail.name / e.detail.payload / e.detail.instanceId を見て
// 振り分ける想定。
export function emitToWeb(instanceId, eventName, payload) {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new CustomEvent("vnlayer:emit", {
        detail: { name: eventName, payload, instanceId },
    }));
}
//# sourceMappingURL=webManager.js.map