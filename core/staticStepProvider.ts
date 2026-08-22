import { Story } from "inkjs";
import { continueUntilChoice } from "./inkStepRunner";
import type { StepProvider } from "./StepProvider";
import type { RunResult, VisualState } from "./types";
import { StoryLoadError, StoryRuntimeError, reportError } from "./errors";
import * as interruptManager from "./managers/interruptManager";
import * as contextManager from "./managers/contextManager";
import type { SaveData, StorySaveData } from "./SaveProvider";
import {
  loadJson,
  type ResourceLoaderOptions,
  type ResourceSource,
} from "./ResourceLoader";

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
//
// 用語メモ(Scenario→Clip改称): このファイル内の変数名/data配信パスは
// 全て「clip」で統一している(data/<clip>/story.json)。以前のシナリオ
// フォルダをそのまま使う場合、フォルダ名自体は変更不要(clipという識別子は
// 単に「data配下のどのフォルダを見るか」を指す文字列でしかないため)。

type StoryHandle = { story: Story; visual: VisualState };

const liveStoryPromises = new Map<string, Promise<StoryHandle>>();
// #interrupt(SwitchFlow)がinit/choose/resetのレスポンスを介さず非同期に
// pushしてくるRunResultの購読先。キーはcacheKey()と同じ。
const pushHandlers = new Map<string, Set<(result: RunResult) => void>>();

// 修正メモ(2026-08-08、「たまにVNLayer.reset()しないと詰まる」不具合の修正):
// #interruptはidle()呼び出し(story.variablesStateへの書き込み)から同期的に
// story.SwitchFlow/ChoosePathString/Continue()を実行する。一方、通常の
// choose()も同じStoryインスタンスに対してChooseChoiceIndex/Continue()を
// 呼ぶ。どちらもawait ensureStory(...)という一瞬のyieldポイントを経由する
// ため、タイミングによっては両者が同じStoryインスタンスへ同時に割り込み、
// 選択肢のindexがズレる/inkjsが例外を投げる等の壊れ方をすることがあった
// (実際の原因: ChooseChoiceIndex()やContinue()は同一Storyインスタンスに
// 対して再入的/並行に呼ばれることを想定していない)。
//
// withLock()は、同じatomKeyに対する全てのStory操作(init/choose/idle/reset/
// restore/getSaveData、および#interruptが起動するSwitchFlow一式)を1本の
// Promiseチェーンで直列化する簡易的な非同期mutex。#interrupt自体は
// 「入口(発火・処理開始)は並列」に設計されている(core/managers/
// interruptManager.ts参照 — 複数の割り込みflowが同時に開いていてよい)が、
// 実際にStoryオブジェクトを操作する瞬間(SwitchFlow/Continue/
// ChooseChoiceIndex等)はJS(シングルスレッド)の上でこのmutexにより
// 自然に一件ずつ直列に処理される。これにより「入口は並列、メインフローへの
// 合流だけ一部直列」という設計をそのまま実現している。
const locks = new Map<string, Promise<unknown>>();

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prior = locks.get(key) ?? Promise.resolve();
  const run = prior.then(fn, fn);
  // 直前の処理が失敗していても、次のwithLock呼び出しがそのエラーで
  // 永久にブロックされないよう、握りつぶした版をlocksに積んでおく
  // (run自体には元のエラーがちゃんと伝播するので、呼び出し元は失敗を検知できる)。
  locks.set(
    key,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );
  return run;
}

// atomKeyを渡された場合はVNインスタンス単位でStoryを分離する(1VNインスタンス
// = 1つの生きたStory、という#interrupt実装が前提とするモデルに合わせるため。
// これにより、同じclipを複数のVNインスタンスで同時にmountしても
// 互いのChooseChoiceIndex等が混ざらなくなる)。
// atomKey未指定(StepProviderをReact無しで直接使うレアケース)の場合のみ、
// clip単独をキーにする以前の挙動にフォールバックする。
function cacheKey(clip: string, atomKey?: string): string {
  return atomKey ?? clip;
}

async function loadStoryJson(
  clip: string,
  dataBaseUrl: string,
  loaderOptions: Pick<ResourceLoaderOptions, "source" | "resolveLocal">,
): Promise<Record<string, unknown>> {
  try {
    return await loadJson<Record<string, unknown>>(`${clip}/story.json`, {
      basePath: dataBaseUrl,
      ...loaderOptions,
    });
  } catch (e) {
    throw new StoryLoadError(`failed to load story.json for clip "${clip}"`, {
      cause: e,
    });
  }
}

async function createStoryHandle(
  clip: string,
  dataBaseUrl: string,
  loaderOptions: Pick<ResourceLoaderOptions, "source" | "resolveLocal">,
  key: string,
): Promise<StoryHandle> {
  const storyJson = await loadStoryJson(clip, dataBaseUrl, loaderOptions);
  const story = new Story(storyJson);
  // ink 1.0以降、story.onErrorをバインドしないとエラー時に例外がスローされる
  // (公式に必須級として推奨されている)。VNLayer全体のエラー報告口
  // (core/errors.ts)へ集約する。
  story.onError = (message: string, type: unknown) => {
    reportError(new StoryRuntimeError(`[${clip}] (${type}) ${message}`));
  };
  const handle: StoryHandle = {
    story,
    visual: { bg: "", characters: {}, speaker: "" },
  };

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

  // 2.15(sync/notify見直し)対応: setContextのsync:true(既定)な変数を
  // 観測するための権限をcontextManagerへ渡す。同じStoryインスタンスに
  // interruptManagerと重複してObserveVariableが乗ることになるが、
  // inkjsのObserveVariableは変数ごとに複数のコールバックを積み重ねる
  // 実装なので、目的の異なる監視同士(#interrupt起動用 / context同期用)が
  // 競合することはない。
  contextManager.attachStory(key, {
    observeVariable: (varName, onChange) => {
      story.ObserveVariable(varName, (_name: string, newValue: unknown) => {
        onChange(newValue);
      });
    },
  });

  return handle;
}

export type StaticStepProviderOptions = {
  // story.json を data/<clip>/story.json として配信している場所のベースURL。
  // 例: "./data" なら "./data/Clip1/story.json" を取りに行く。
  dataBaseUrl?: string;
  // ink成果物(story.json)の取得方法。既定は'fetch'(通常のURL経由)。
  // Next.js等、fetchがpublicフォルダのものしか取れない環境では
  // 'local'+resolveLocalでバンドラーのimport()等から読み込ませることもできる
  // (core/ResourceLoader.ts参照)。ink側は1つのStepProviderインスタンス=
  // 1つの取得方法という単位で十分なため、素材(assets)側のような
  // 「呼び出しごとの個別指定」は用意していない(用途が異なる: 複数の取得
  // 方法を混ぜたい場合は、mount単位でstepProviderのインスタンス自体を
  // 分ければ実現できる)。
  source?: ResourceSource;
  resolveLocal?: (path: string) => Promise<unknown>;
};

export function createStaticStepProvider(
  options: StaticStepProviderOptions = {},
): StepProvider {
  const dataBaseUrl = options.dataBaseUrl ?? "./data";
  const loaderOptions = {
    source: options.source,
    resolveLocal: options.resolveLocal,
  };

  function ensureStory(clip: string, atomKey?: string): Promise<StoryHandle> {
    const key = cacheKey(clip, atomKey);
    let handlePromise = liveStoryPromises.get(key);
    if (!handlePromise) {
      // fetchが完了する前に(同期的に)Mapへ登録するのがポイント。
      // これでこの直後に来る2回目の呼び出しも、新しくStoryを作らず
      // このPromiseを待つだけになる。
      handlePromise = createStoryHandle(clip, dataBaseUrl, loaderOptions, key);
      liveStoryPromises.set(key, handlePromise);
      handlePromise.catch(() => {
        // 初期化に失敗したら、次回リトライできるようキャッシュを解放する。
        liveStoryPromises.delete(key);
        interruptManager.dispose(key);
      });
    }
    return handlePromise;
  }

  function runAndCache(handle: StoryHandle): RunResult {
    const result = continueUntilChoice(handle.story, handle.visual);
    handle.visual = result.visual;
    return result;
  }

  return {
    async init(clip, atomKey) {
      const key = cacheKey(clip, atomKey);
      return withLock(key, async () => {
        const handle = await ensureStory(clip, atomKey);
        return runAndCache(handle);
      });
    },
    async choose(clip, index, atomKey) {
      const key = cacheKey(clip, atomKey);
      return withLock(key, async () => {
        const handle = await ensureStory(clip, atomKey);
        const validCount = handle.story.currentChoices.length;
        if (index < 0 || index >= validCount) {
          // #tick等で複数の選択肢に同時にタイマーを張っている場合、一番早く経過した
          // ものが既にストーリーを先に進めた後で、後発のタイマーが古いindexのまま
          // choose()を呼んでしまうことがある(競合状態)。実害は無い(古い呼び出しは
          // 単に無視して現在の状態を返すだけ)が、inkjs内部の例外に頼らず、ここで
          // 早期に弾いて分かりやすいエラーとして報告しておく。
          // 注意: currentChoicesは「今アクティブなフロー」のものを見る
          // (#interrupt中は割り込みflow自身の選択肢になる。SwitchFlowの仕様)。
          reportError(
            new StoryRuntimeError(
              `choose(${index}) ignored: only ${validCount} choice(s) are currently available ` +
                `(likely a stale #tick timer firing after the story already advanced).`,
            ),
          );
          return runAndCache(handle);
        }
        try {
          handle.story.ChooseChoiceIndex(index);
        } catch (e) {
          reportError(
            new StoryRuntimeError("ChooseChoiceIndex failed", { cause: e }),
          );
        }
        const result = runAndCache(handle);
        // #interrupt(SwitchFlow)対応: 今選んだ選択肢が割り込みflow自身のもの
        // だった場合、そのflowがまだ続くか(=result.choicesが割り込みflow側の
        // 続きの選択肢)、ちょうど尽きたか(=元フローへ自動で戻す)をここで
        // 判定する。割り込み中でなければ何もせずresultをそのまま返す。
        const resumed = interruptManager.finishFlowIfDone(
          key,
          handle.story,
          result,
        );
        handle.visual = resumed.visual;
        return resumed;
      });
    },
    async idle(clip, varName, value, atomKey) {
      const key = cacheKey(clip, atomKey);
      return withLock(key, async () => {
        const handle = await ensureStory(clip, atomKey);
        // idle()のvalueは呼び出し側(ホストページ)が任意の値を渡せる設計上unknown型。
        // inkjsのvariablesStateは緩い型(実質any)で受け取る前提なので、ここで明示キャストする。
        // この書き込みが#interrupt側で張っているObserveVariableの発火トリガーにもなる
        // (このwithLock内で同期的に発火するので、他のStory操作と割り込むことはない)。
        handle.story.variablesState[varName] = value as any;
      });
    },
    async reset(clip, atomKey) {
      const key = cacheKey(clip, atomKey);
      return withLock(key, async () => {
        liveStoryPromises.delete(key);
        // 直前までの#interrupt許可/pending/開いているflowは、クリップを
        // 最初からやり直す以上いったん破棄する(古いknot名を指したままだと
        // 事故るため)。
        interruptManager.dispose(key);
        const handle = await ensureStory(clip, atomKey);
        return runAndCache(handle);
      });
    },
    onPush(atomKey, callback) {
      let set = pushHandlers.get(atomKey);
      if (!set) {
        set = new Set();
        pushHandlers.set(atomKey, set);
      }
      set.add(callback);
      return () => {
        set!.delete(callback);
      };
    },
    async getSaveData(clip, atomKey): Promise<StorySaveData | null> {
      const key = cacheKey(clip, atomKey);
      return withLock(key, async () => {
        // 簡易セーブ機能用。まだこのクリップのStoryが生成されていない
        // (initすら呼ばれていない)場合はnullを返す(何も無いのに保存しても
        // 意味が無いため)。
        const handlePromise = liveStoryPromises.get(key);
        if (!handlePromise) return null;
        const handle = await handlePromise;

        // 修正メモ(2026-08-09、リロード後に話が巻き戻る/固まる不具合の修正):
        // #interrupt(SwitchFlow)は「入口は並列」で開始できる設計のため、
        // メインフロー(default flow)がまだ#wait:等でリアルタイム処理中の間に
        // 別の割り込み(例: まばたき反応)が発火し、その割り込み自身の
        // advance()完了時にも自動セーブが走ることがある。この瞬間に
        // story.state.ToJson()を取ると、「メインフローが実際にどこで
        // 止まっているか」とズレた(割り込みflow視点の)スナップショットに
        // なってしまい、復元時に選択肢が食い違ったり、トンネル復帰
        // (->->)の対応が取れず"Found tunnel onwards statement, when
        // expected end of flow"のようなランタイムエラーで固まる原因に
        // なっていた。
        // 今アクティブなフローがdefault flowの時だけ保存することで、
        // 「メインフローが本当に安定して止まっている瞬間」以外のスナップ
        // ショットを保存しないようにする(割り込みflow中の保存は単にスキップ
        // され、次にdefault flowへ戻ったタイミングの保存で自然に追いつく)。
        if (!handle.story.currentFlowIsDefaultFlow) {
          return null;
        }
        // 選択肢が無い（END/DONE 直後など）は保存しない
        //    復元しても「待ち状態」として意味が薄い／壊れやすい
        if (handle.story.currentChoices.length === 0) {
          return null;
        }

        // 3) ToJson 自体を try/catch
        //    previousPointer 等が無効な瞬間はスキップ
        try {
          const inkStateJson = handle.story.state.ToJson();
          return {
            inkStateJson,
            visual: handle.visual,
          };
        } catch (e) {
          reportError(
            new StoryRuntimeError(
              "failed to persist save data (story state not serializable at this moment; skipped)",
              { cause: e },
            ),
          );
          return null;
        }
      });
    },
    async restore(clip, save, atomKey): Promise<RunResult> {
      const key = cacheKey(clip, atomKey);
      return withLock(key, async () => {
        // 簡易セーブ機能用。story.state.LoadJson()でink実行状態を丸ごと
        // 復元する(選択履歴のリプレイではなく、inkjsが持つシリアライズ機構
        // そのものを使う — 変数・訪問済みノット・RANDOM()の状態等も含めて
        // 正確に復元できる)。
        const handle = await ensureStory(clip, atomKey);
        try {
          handle.story.state.LoadJson(save.inkStateJson);
        } catch (e) {
          reportError(
            new StoryRuntimeError(
              "failed to restore ink state from save data, starting fresh instead",
              { cause: e },
            ),
          );
          return runAndCache(handle);
        }
        handle.visual = save.visual;
        const choices = handle.story.currentChoices.map((c, i) => ({
          text: c.text,
          index: i,
          tags: c.tags ?? [],
        }));
        // 復元直後は新しい本文を進行させない(保存時点の選択肢待ち状態へ
        // そのまま戻すだけ)。stepsは空を返す(会話ログ/直前メッセージの
        // 復元はSaveDataの別フィールド経由でcore/useStoryEngine.ts側が
        // 行う。ここでは「ink自身の実行状態」の復元だけに専念する)。
        return { steps: [], choices, visual: handle.visual };
      });
    },
  };
}
