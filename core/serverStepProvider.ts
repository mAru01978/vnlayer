import type { StepProvider } from "./StepProvider";
import type { RunResult } from "./types";

async function callStoryApi<T = RunResult>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include", // 別オリジンのサーバーでもcookieセッションを使えるように
  });
  if (!res.ok) {
    throw new Error(`story api error: ${res.status}`);
  }
  return res.json();
}

export type ServerStepProviderOptions = {
  // 既定は同一オリジンの相対パス "/api/story"(今までのNext.js運用と同じ)。
  // vnlayer.js(静的バンドル)を別ドメインでホストしつつ、実行だけは既存の
  // Next.jsサーバーにやらせたい場合は、絶対URL(例: "https://example.com/api/story")を渡す。
  endpoint?: string;
};

export function createServerStepProvider(
  options: ServerStepProviderOptions = {},
): StepProvider {
  const endpoint = options.endpoint ?? "/api/story";
  return {
    init: (scenario, atomKey) =>
      callStoryApi<RunResult>(endpoint, { action: "init", scenario, atomKey }),
    choose: (scenario, index, atomKey) =>
      callStoryApi<RunResult>(endpoint, { action: "choose", index, scenario, atomKey }),
    idle: async (scenario, varName, value, atomKey) => {
      await callStoryApi<{ ok: boolean }>(endpoint, {
        action: "idle",
        scenario,
        varName,
        value,
        atomKey,
      });
    },
    reset: (scenario, atomKey) =>
      callStoryApi<RunResult>(endpoint, { action: "reset", scenario, atomKey }),
    // #interrupt(SwitchFlow経由のpush)はサーバー版のリクエスト/レスポンス
    // 方式とは相性が悪い(サーバー側でStoryを常駐させ、WebSocket等のpush経路が
    // 必要になる)ため、現状は未対応。onPushを実装しないことで
    // core/useStoryEngine.ts側は自動的にこの機能をスキップする
    // (StepProvider.ts側のコメント参照)。
  };
}

// 既存のNext.js API Route(/api/story、サーバー側でInkを実行するcookieセッション方式)を
// そのまま叩く既定のStepProvider(endpoint="/api/story")。今まで通りNext.js運用ではこれを使う。
// 別オリジンのサーバーを指定したい場合は createServerStepProvider({ endpoint }) を使う。
export const serverStepProvider: StepProvider = createServerStepProvider();
