async function callStoryApi(endpoint, body) {
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include', // 別オリジンのサーバーでもcookieセッションを使えるように
    });
    if (!res.ok) {
        throw new Error(`story api error: ${res.status}`);
    }
    return res.json();
}
export function createServerStepProvider(options = {}) {
    const endpoint = options.endpoint ?? '/api/story';
    return {
        init: (scenario) => callStoryApi(endpoint, { action: 'init', scenario }),
        choose: (scenario, index) => callStoryApi(endpoint, { action: 'choose', index, scenario }),
        idle: async (scenario, varName, value) => {
            await callStoryApi(endpoint, { action: 'idle', scenario, varName, value });
        },
        reset: (scenario) => callStoryApi(endpoint, { action: 'reset', scenario }),
    };
}
// 既存のNext.js API Route(/api/story、サーバー側でInkを実行するcookieセッション方式)を
// そのまま叩く既定のStepProvider(endpoint="/api/story")。今まで通りNext.js運用ではこれを使う。
// 別オリジンのサーバーを指定したい場合は createServerStepProvider({ endpoint }) を使う。
export const serverStepProvider = createServerStepProvider();
//# sourceMappingURL=serverStepProvider.js.map