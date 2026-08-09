import { Story } from "inkjs";
import { continueUntilChoice } from "./inkStepRunner";
import { StoryLoadError, StoryRuntimeError, reportError } from "./errors";
import * as interruptManager from "./managers/interruptManager";
const liveStoryPromises = new Map();
// #interrupt(SwitchFlow)がinit/choose/resetのレスポンスを介さず非同期に
// pushしてくるRunResultの購読先。キーはcacheKey()と同じ。
const pushHandlers = new Map();
// atomKeyを渡された場合はVNインスタンス単位でStoryを分離する(1VNインスタンス
// = 1つの生きたStory、という#interrupt実装が前提とするモデルに合わせるため。
// これにより、同じclipを複数のVNインスタンスで同時にmountしても
// 互いのChooseChoiceIndex等が混ざらなくなる)。
// atomKey未指定(StepProviderをReact無しで直接使うレアケース)の場合のみ、
// clip単独をキーにする以前の挙動にフォールバックする。
function cacheKey(clip, atomKey) {
    return atomKey ?? clip;
}
async function loadStoryJson(clip, dataBaseUrl) {
    const res = await fetch(`${dataBaseUrl}/${clip}/story.json`);
    if (!res.ok) {
        throw new StoryLoadError(`failed to load story.json for clip "${clip}": ${res.status}`);
    }
    return res.json();
}
async function createStoryHandle(clip, dataBaseUrl, key) {
    const storyJson = await loadStoryJson(clip, dataBaseUrl);
    const story = new Story(storyJson);
    // ink 1.0以降、story.onErrorをバインドしないとエラー時に例外がスローされる
    // (公式に必須級として推奨されている)。VNLayer全体のエラー報告口
    // (core/errors.ts)へ集約する。
    story.onError = (message, type) => {
        reportError(new StoryRuntimeError(`[${clip}] (${type}) ${message}`));
    };
    const handle = { story, visual: { bg: "", characters: {}, speaker: "" } };
    // #interrupt(SwitchFlow+ObserveVariable)用に、このStoryインスタンスを
    // 操作する権限(host)をinterruptManagerへ渡す。
    interruptManager.attachStory(key, {
        story,
        getVisual: () => handle.visual,
        setVisual: (v) => {
            handle.visual = v;
        },
        pushResult: (result) => {
            pushHandlers.get(key)?.forEach((cb) => cb(result));
        },
    });
    return handle;
}
export function createStaticStepProvider(options = {}) {
    const dataBaseUrl = options.dataBaseUrl ?? "./data";
    function ensureStory(clip, atomKey) {
        const key = cacheKey(clip, atomKey);
        let handlePromise = liveStoryPromises.get(key);
        if (!handlePromise) {
            // fetchが完了する前に(同期的に)Mapへ登録するのがポイント。
            // これでこの直後に来る2回目の呼び出しも、新しくStoryを作らず
            // このPromiseを待つだけになる。
            handlePromise = createStoryHandle(clip, dataBaseUrl, key);
            liveStoryPromises.set(key, handlePromise);
            handlePromise.catch(() => {
                // 初期化に失敗したら、次回リトライできるようキャッシュを解放する。
                liveStoryPromises.delete(key);
                interruptManager.dispose(key);
            });
        }
        return handlePromise;
    }
    function runAndCache(handle) {
        const result = continueUntilChoice(handle.story, handle.visual);
        handle.visual = result.visual;
        return result;
    }
    return {
        async init(clip, atomKey) {
            const handle = await ensureStory(clip, atomKey);
            return runAndCache(handle);
        },
        async choose(clip, index, atomKey) {
            const handle = await ensureStory(clip, atomKey);
            const key = cacheKey(clip, atomKey);
            const validCount = handle.story.currentChoices.length;
            if (index < 0 || index >= validCount) {
                // #tick等で複数の選択肢に同時にタイマーを張っている場合、一番早く経過した
                // ものが既にストーリーを先に進めた後で、後発のタイマーが古いindexのまま
                // choose()を呼んでしまうことがある(競合状態)。実害は無い(古い呼び出しは
                // 単に無視して現在の状態を返すだけ)が、inkjs内部の例外に頼らず、ここで
                // 早期に弾いて分かりやすいエラーとして報告しておく。
                // 注意: currentChoicesは「今アクティブなフロー」のものを見る
                // (#interrupt中は割り込みflow自身の選択肢になる。SwitchFlowの仕様)。
                reportError(new StoryRuntimeError(`choose(${index}) ignored: only ${validCount} choice(s) are currently available ` +
                    `(likely a stale #tick timer firing after the story already advanced).`));
                return runAndCache(handle);
            }
            try {
                handle.story.ChooseChoiceIndex(index);
            }
            catch (e) {
                reportError(new StoryRuntimeError("ChooseChoiceIndex failed", { cause: e }));
            }
            const result = runAndCache(handle);
            // #interrupt(SwitchFlow)対応: 今選んだ選択肢が割り込みflow自身のもの
            // だった場合、そのflowがまだ続くか(=result.choicesが割り込みflow側の
            // 続きの選択肢)、ちょうど尽きたか(=元フローへ自動で戻す)をここで
            // 判定する。割り込み中でなければ何もせずresultをそのまま返す。
            const resumed = interruptManager.resumeDefaultFlowIfInterruptFinished(key, handle.story, result);
            handle.visual = resumed.visual;
            return resumed;
        },
        async idle(clip, varName, value, atomKey) {
            const handle = await ensureStory(clip, atomKey);
            // idle()のvalueは呼び出し側(ホストページ)が任意の値を渡せる設計上unknown型。
            // inkjsのvariablesStateは緩い型(実質any)で受け取る前提なので、ここで明示キャストする。
            // この書き込みが#interrupt側で張っているObserveVariableの発火トリガーにもなる。
            handle.story.variablesState[varName] = value;
        },
        async reset(clip, atomKey) {
            const key = cacheKey(clip, atomKey);
            liveStoryPromises.delete(key);
            // 直前までの#interrupt許可/pending/キューは、クリップを最初から
            // やり直す以上いったん破棄する(古いknot名を指したままだと事故るため)。
            interruptManager.dispose(key);
            const handle = await ensureStory(clip, atomKey);
            return runAndCache(handle);
        },
        onPush(atomKey, callback) {
            let set = pushHandlers.get(atomKey);
            if (!set) {
                set = new Set();
                pushHandlers.set(atomKey, set);
            }
            set.add(callback);
            return () => {
                set.delete(callback);
            };
        },
    };
}
//# sourceMappingURL=staticStepProvider.js.map