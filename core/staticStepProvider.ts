import { Story } from 'inkjs';
import { continueUntilChoice } from './inkStepRunner';
import type { StepProvider } from './StepProvider';
import type { RunResult, VisualState } from './types';

// index.html + vnlayer.js + assets(素材・ink) だけで動く運用向けのStepProvider。
// Next.jsのcookieセッション/replay方式とは違い、ページを開いている間はブラウザの
// メモリ上にStoryインスタンスをそのまま生かし続ける(= 選択肢を選ぶたびに
// 最初から選び直す必要が無いので、RANDOM()を含むノットがあってもズレない)。
//
// トレードオフ: ページをリロードすると進行状況は失われる(現状は永続化なし)。
// 「素材+inkだけで運用したい/サーバーを持ちたくない」という目的には十分だが、
// リロード後も続きから、が必要になったら choiceHistory+storySeed を
// localStorageに保存する方式(lib/story/server/engine.tsと同じ考え方)を
// 後で追加すればよい。

type StoryHandle = { story: Story; visual: VisualState };

const liveStories = new Map<string, StoryHandle>();

async function loadStoryJson(scenario: string, dataBaseUrl: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${dataBaseUrl}/${scenario}/story.json`);
  if (!res.ok) {
    throw new Error(`[VNLayer static] failed to load story.json for "${scenario}": ${res.status}`);
  }
  return res.json();
}

export type StaticStepProviderOptions = {
  // story.json を data/<scenario>/story.json として配信している場所のベースURL。
  // 例: "./data" なら "./data/Scenario1/story.json" を取りに行く。
  dataBaseUrl?: string;
};

export function createStaticStepProvider(options: StaticStepProviderOptions = {}): StepProvider {
  const dataBaseUrl = options.dataBaseUrl ?? './data';

  async function ensureStory(scenario: string): Promise<StoryHandle> {
    let handle = liveStories.get(scenario);
    if (!handle) {
      const storyJson = await loadStoryJson(scenario, dataBaseUrl);
      const story = new Story(storyJson);
      story.onError = (message: string, type: unknown) => {
        console.warn(`[VNLayer static onError:${scenario}] (${type}) ${message}`);
      };
      story.variablesState['currentHour'] = new Date().getHours();
      story.variablesState['dayOfWeek'] = new Date().getDay();
      handle = { story, visual: { bg: '', characters: {}, speaker: '' } };
      liveStories.set(scenario, handle);
    }
    return handle;
  }

  function runAndCache(scenario: string, handle: StoryHandle): RunResult {
    const result = continueUntilChoice(handle.story, handle.visual);
    handle.visual = result.visual;
    return result;
  }

  return {
    async init(scenario) {
      const handle = await ensureStory(scenario);
      return runAndCache(scenario, handle);
    },
    async choose(scenario, index) {
      const handle = await ensureStory(scenario);
      const validCount = handle.story.currentChoices.length;
      if (index < 0 || index >= validCount) {
        // #tick等で複数の選択肢に同時にタイマーを張っている場合、一番早く経過した
        // ものが既にストーリーを先に進めた後で、後発のタイマーが古いindexのまま
        // choose()を呼んでしまうことがある(競合状態)。実害は無い(古い呼び出しは
        // 単に無視して現在の状態を返すだけ)が、inkjs内部の例外に頼らず、ここで
        // 早期に弾いて分かりやすい警告にしておく。
        console.warn(
          `[VNLayer static] choose(${index}) ignored: only ${validCount} choice(s) are currently available ` +
            `(likely a stale #tick timer firing after the story already advanced).`
        );
        return runAndCache(scenario, handle);
      }
      try {
        handle.story.ChooseChoiceIndex(index);
      } catch (e) {
        console.warn('[VNLayer static] ChooseChoiceIndex failed:', e);
      }
      return runAndCache(scenario, handle);
    },
    async idle(scenario, varName, value) {
      const handle = await ensureStory(scenario);
      // idle()のvalueは呼び出し側(ホストページ)が任意の値を渡せる設計上unknown型。
      // inkjsのvariablesStateは緩い型(実質any)で受け取る前提なので、ここで明示キャストする。
      handle.story.variablesState[varName] = value as any;
    },
    async reset(scenario) {
      liveStories.delete(scenario);
      const handle = await ensureStory(scenario);
      return runAndCache(scenario, handle);
    },
  };
}
