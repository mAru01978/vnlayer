// #wait: や type_wait:on の推定待ちなど、「時間経過で進む」処理を
// 外部からの割り込み(interrupt)で即座に打ち切れるようにするための共通sleep。
//
// 通常のsetTimeoutベースのPromiseと違い、signalがabortされた時点で
// (実際の経過時間に関係なく)即resolveする。これによって
// 「#wait:中でもクリックした瞬間に反応する」体感速度を実現する。
//
// 呼び出し側(useStoryEngine.ts)がタグ実行1回(advance()呼び出し1回)ごとに
// 新しいAbortControllerを用意し、割り込み発生時にcontroller.abort()するだけで、
// このsleepを使っている待ち処理全部が一斉に早期終了する。
export function abortableSleep(ms, signal) {
    if (signal?.aborted)
        return Promise.resolve();
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
        }, ms);
        const onAbort = () => {
            clearTimeout(timer);
            resolve();
        };
        signal?.addEventListener('abort', onAbort, { once: true });
    });
}
//# sourceMappingURL=abortableSleep.js.map