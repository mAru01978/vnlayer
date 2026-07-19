import { Story } from 'inkjs';
import { continueUntilChoice } from './inkStepRunner';
const liveStories = new Map();
async function loadStoryJson(scenario, dataBaseUrl) {
    const res = await fetch(`${dataBaseUrl}/${scenario}/story.json`);
    if (!res.ok) {
        throw new Error(`[VNLayer static] failed to load story.json for "${scenario}": ${res.status}`);
    }
    return res.json();
}
export function createStaticStepProvider(options = {}) {
    const dataBaseUrl = options.dataBaseUrl ?? './data';
    async function ensureStory(scenario) {
        let handle = liveStories.get(scenario);
        if (!handle) {
            const storyJson = await loadStoryJson(scenario, dataBaseUrl);
            const story = new Story(storyJson);
            story.onError = (message, type) => {
                console.warn(`[VNLayer static onError:${scenario}] (${type}) ${message}`);
            };
            story.variablesState['currentHour'] = new Date().getHours();
            story.variablesState['dayOfWeek'] = new Date().getDay();
            handle = { story, visual: { bg: '', characters: {}, speaker: '' } };
            liveStories.set(scenario, handle);
        }
        return handle;
    }
    function runAndCache(scenario, handle) {
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
            }
            catch (e) {
                console.warn('[VNLayer static] ChooseChoiceIndex failed:', e);
            }
            return runAndCache(scenario, handle);
        },
        async idle(scenario, varName, value) {
            const handle = await ensureStory(scenario);
            // idle()のvalueは呼び出し側(ホストページ)が任意の値を渡せる設計上unknown型。
            // inkjsのvariablesStateは緩い型(実質any)で受け取る前提なので、ここで明示キャストする。
            handle.story.variablesState[varName] = value;
        },
        async reset(scenario) {
            liveStories.delete(scenario);
            const handle = await ensureStory(scenario);
            return runAndCache(scenario, handle);
        },
    };
}
//# sourceMappingURL=staticStepProvider.js.map