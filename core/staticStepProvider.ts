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
type StoryJson = Record<string,any>;

async function loadStoryJson(scenario: string, dataBaseUrl: string): Promise<StoryJson> {
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
      try {
        handle.story.ChooseChoiceIndex(index);
      } catch (e) {
        console.warn('[VNLayer static] ChooseChoiceIndex failed:', e);
      }
      return runAndCache(scenario, handle);
    },
    async idle(scenario, varName, value) {
      const handle = await ensureStory(scenario);
      handle.story.variablesState[varName] = value;
    },
    async reset(scenario) {
      liveStories.delete(scenario);
      const handle = await ensureStory(scenario);
      return runAndCache(scenario, handle);
    },
  };
}
