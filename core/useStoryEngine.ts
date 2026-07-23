'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { dispatchTag, getTagConfig, type SceneHandlers } from '../tags/index';
import { getCharacterSlot } from '../tags/characterSlots';
import { getDefaultStepProvider } from './defaultStepProvider';
import { abortableSleep } from './abortableSleep';
import type { StepProvider } from './StepProvider';
import type {
  CamState,
  CharacterState,
  Choice,
  LineEntry,
  PositionOverrides,
  ActiveMessage,
  RunResult,
  StoryEngine,
} from './types';
import type { TypeConfig } from '../tags/defs/type';

// フェーズ2でのポイント:
// - タグの「ラベル→実際の値」の変換(wait:long→1200ms、cam:zoom→scale1.6等)は
//   全部 tags/defs/*.ts に移った。ここのhandlersは「もう解決済みの値」を
//   受け取って状態を更新するだけで、waitDurations/camConfig等を一切知らない。
// - characterSlotsは tags/characterSlots.ts の共有ストア経由(Next.js/静的どちらの
//   起動時にも注入できる)。
// - stepProviderを渡さなかった場合は getDefaultStepProvider() (通常は
//   serverStepProvider、静的バンドルではstaticStepProviderに差し替え済み)を使う。
export function useStoryEngine(
  scenario: string,
  options: { stepProvider?: StepProvider; onNavigate?: (path: string) => void } = {}
): StoryEngine {
  const stepProvider = options.stepProvider ?? getDefaultStepProvider();
  const onNavigate = options.onNavigate;

  const [lines, setLines] = useState<LineEntry[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [bg, setBg] = useState('');
  const [characters, setCharacters] = useState<Record<string, CharacterState>>({});
  const [speaker, setSpeakerState] = useState('');
  const [cam, setCamState] = useState<CamState>({ target: '', scale: 1, originX: 50, originY: 50 });
  const [shake, setShakeState] = useState({ nonce: 0, amplitude: 0, duration: 300 });
  const [userLine, setUserLine] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [choicesHidden, setChoicesHidden] = useState(false);
  const [messageWindowHidden, setMessageWindowHiddenState] = useState(false);
  const [positionOverrides, setPositionOverrides] = useState<PositionOverrides>({});
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [activeMessage, setActiveMessageState] = useState<ActiveMessage>(null);
  const [flash, setFlash] = useState<{ color: string; durationMs: number } | null>(null);

  const initialTypeSpeed = getTagConfig<TypeConfig>('type')?.speeds.normal ?? 30;
  const [typeSpeedMs, setTypeSpeedMsState] = useState<number>(initialTypeSpeed);

  const typeSpeedRef = useRef<number>(initialTypeSpeed);
  const nextRevealFadeRef = useRef(false);
  const typeWaitEnabledRef = useRef(false);
  const typeWaitBufferRef = useRef(1500);
  const positionOverridesRef = useRef<PositionOverrides>({});
  const transientTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // notify()の即時反応機構: advance()の1回の呼び出し(=タグ処理のバッチ)ごとに
  // 新しいAbortControllerを張り直す。notify()が呼ばれるとabort()され、
  // 実行中のwait/type_wait推定待ちが即resolveする。
  const abortControllerRef = useRef<AbortController | null>(null);
  // 待ちを打ち切った時点でまだ #interrupt 付き選択肢に辿り着いていない場合、
  // 「即時反応の要求があった」ことだけを記録しておき、後でchoicesが更新される
  // (=event_loop等に到達する)たびにチェックして消費する。
  const pendingInterruptRef = useRef(false);
  // notify()のevent_${name}_seq採番用。以前はapi.ts側(Instance.eventSeq)が
  // 持っていたが、notifyをengine側の機能として一本化したのでここに移した。
  const eventSeqRef = useRef<Record<string, number>>({});

  // isProcessing(React state)は非同期にしかコミットされないため、
  // 「短時間に連続でinit()/choose()が呼ばれる」ケース(StrictModeの二重
  // effect実行、素早い連打、event_loopの自動choose()との競合等)で
  // 古い値を読んですり抜けてしまうことがあった。同期的に読み書きできる
  // ref側を「本物のロック」として使い、setIsProcessing(state)の方は
  // 画面表示(ボタンのdisabled等)用の見た目の値として残す。
  const isProcessingRef = useRef(false);
  // advance()が呼ばれるたびにインクリメントする世代カウンタ。
  // 途中で新しいadvance()が始まった場合、古い方はここを見て自分が
  // 「もう用済み(stale)」だと気づき、それ以上State更新をせずに
  // 静かに引き下がる。これにより、何らかの理由でadvance()が
  // 二重に走ってしまっても(原因不明でも)最新の1本だけが結果を
  // 反映する、という形で表示の破綻を防ぐ。
  const advanceGenerationRef = useRef(0);

  const clearBubbleTimer = useCallback(() => {
    if (transientTimerRef.current) {
      clearTimeout(transientTimerRef.current);
      transientTimerRef.current = null;
    }
  }, []);

  const setAnimDirect = useCallback((name: string, motion: string) => {
    setCharacters((prev) => ({
      ...prev,
      [name]: {
        expression: prev[name]?.expression ?? 'normal',
        motion,
        // 普通のanim:はループ/逆再生をリセットした「素の」モーション再生として扱う。
        // 再生速度(animSpeed)はキャラ単位の持続設定なので維持する。
        animLoop: false,
        animReverse: false,
        animSpeed: prev[name]?.animSpeed,
      },
    }));
  }, []);

  const setAnimLoop = useCallback((name: string, motion: string) => {
    setCharacters((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        expression: prev[name]?.expression ?? 'normal',
        motion,
        animLoop: true,
        animReverse: false,
      },
    }));
  }, []);

  const setAnimStop = useCallback((name: string) => {
    setCharacters((prev) => {
      if (!prev[name]) return prev;
      return {
        ...prev,
        [name]: {
          ...prev[name],
          motion: undefined,
          animLoop: false,
          animReverse: false,
        },
      };
    });
  }, []);

  const setAnimSpeedHandler = useCallback((name: string, speed: number) => {
    setCharacters((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        expression: prev[name]?.expression ?? 'normal',
        animSpeed: speed,
      },
    }));
  }, []);

  const setAnimReverse = useCallback((name: string, motion: string) => {
    setCharacters((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        expression: prev[name]?.expression ?? 'normal',
        motion,
        animReverse: true,
      },
    }));
  }, []);

  const setGaze = useCallback((name: string, target: { x: number; y: number } | 'reset') => {
    setCharacters((prev) => {
      if (!prev[name] && target === 'reset') return prev;
      const { gaze: _drop, ...rest } = prev[name] ?? { expression: 'normal' };
      return {
        ...prev,
        [name]: target === 'reset' ? rest : { ...rest, gaze: target },
      };
    });
  }, []);

  const hideChar = useCallback((name: string) => {
    setCharacters((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const setChoicesVisible = useCallback((visible: boolean) => {
    setChoicesHidden(!visible);
  }, []);

  const setMessageWindowVisible = useCallback((visible: boolean) => {
    setMessageWindowHiddenState(!visible);
  }, []);

  const setPos = useCallback(
    (name: string, coords: { originX: number; originY: number } | 'reset', durationMs?: number) => {
      if (coords === 'reset') {
        setPositionOverrides((prev) => {
          const next = { ...prev };
          delete next[name];
          positionOverridesRef.current = next;
          return next;
        });
        return;
      }
      setPositionOverrides((prev) => {
        const next = { ...prev, [name]: { ...coords, durationMs } };
        positionOverridesRef.current = next;
        return next;
      });
    },
    []
  );

  const setMessageMode = useCallback(
    (mode: 'transient' | 'persist' | 'hide', transientDurationMs?: number) => {
      if (mode === 'hide') {
        clearBubbleTimer();
        setActiveMessageState(null);
        return;
      }
      if (mode === 'transient') {
        clearBubbleTimer();
        transientTimerRef.current = setTimeout(() => {
          setActiveMessageState(null);
        }, transientDurationMs ?? 4000);
        return;
      }
      clearBubbleTimer();
    },
    [clearBubbleTimer]
  );

  const setCamera = useCallback((scale: number, target: string | undefined, _durationMs: number) => {
    setCamState((prev) => {
      const slot = target
        ? positionOverridesRef.current[target] ?? getCharacterSlot(target) ?? { originX: prev.originX, originY: prev.originY }
        : { originX: prev.originX, originY: prev.originY };
      return { target: target ?? prev.target, scale, originX: slot.originX, originY: slot.originY };
    });
  }, []);

  const shakeScreen = useCallback((amplitude: number, duration: number) => {
    setShakeState((prev) => ({ nonce: prev.nonce + 1, amplitude, duration }));
  }, []);

  const advance = useCallback(
    async (result: RunResult) => {
      // このバッチの世代番号。以後、他のadvance()がこれより新しい世代を
      // 発行していたら(myGeneration !== advanceGenerationRef.current)、
      // このバッチは「もう古い」と判断してState更新を止める。
      const myGeneration = ++advanceGenerationRef.current;
      const isStale = () => myGeneration !== advanceGenerationRef.current;

      isProcessingRef.current = true;
      setIsProcessing(true);
      let pendingGoto: string | null = null;

      const handlers: SceneHandlers = {
        handleFlash: (color, durationMs) => {
          setFlash({ color, durationMs });
          setTimeout(() => setFlash(null), durationMs);
        },
        setBg: (name) => setBg(name),
        setChar: (name, expression) =>
          setCharacters((prev) => ({ ...prev, [name]: { expression } })),
        setAnim: (name, motion) => setAnimDirect(name, motion),
        setAnimLoop: (name, motion) => setAnimLoop(name, motion),
        setAnimStop: (name) => setAnimStop(name),
        setAnimSpeed: (name, speed) => setAnimSpeedHandler(name, speed),
        setAnimReverse: (name, motion) => setAnimReverse(name, motion),
        setGaze: (name, target) => setGaze(name, target),
        setSpeaker: (name) => setSpeakerState(name),
        onGoto: (path) => {
          pendingGoto = path;
        },
        onOpen: (url) => {
          if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        },
        onScroll: (target) => {
          if (typeof window === 'undefined' || typeof document === 'undefined') return;
          const n = Number(target);
          if (Number.isFinite(n) && target.trim() !== '') {
            window.scrollTo({ top: n, behavior: 'smooth' });
            return;
          }
          // id/セレクタ/アンカー名として解決を試みる(#付きセレクタ、素のid名どちらもOK)
          const el = document.getElementById(target) ?? document.querySelector(target);
          el?.scrollIntoView({ behavior: 'smooth' });
        },
        wait: (ms) => {
          // 重要: このwait呼び出し専用のControllerをここで新規発行する。
          // 以前はadvance()バッチ全体で1つのcontrollerを使い回していたため、
          // 「このwaitより前に来たクリック」がまだ発生してもいない後続の
          // #wait:まで巻き込んで即座に打ち切ってしまうバグがあった
          // (例: からかうシーンの「・・・」の文字送りをクリックでスキップ
          //  しただけなのに、直後の# wait:longまで一緒に飛ばされていた)。
          // waitごとに新しいcontrollerにすることで、abort()は「今まさに
          // 実行中のwait」だけに効き、まだ始まっていない後続のwaitには
          // 影響しなくなる。
          if (isStale()) return Promise.resolve();
          const controller = new AbortController();
          abortControllerRef.current = controller;
          return abortableSleep(ms, controller.signal);
        },
        setCamera,
        shakeScreen,
        onUnknownTag: (tag) => console.warn('unknown tag encountered:', tag),
        hideChar,
        setChoicesVisible,
        setMessageWindowVisible,
        setPos,
        clearLines: () => {
          setLines([]);
          clearBubbleTimer();
          setActiveMessageState(null);
        },
        setMessageMode,
        setNextRevealFade: (fadeIn) => {
          nextRevealFadeRef.current = fadeIn;
        },
        setTypeSpeed: (ms) => {
          typeSpeedRef.current = ms;
          setTypeSpeedMsState(ms);
        },
        setTypeWaitMode: (enabled, readingBufferMs) => {
          typeWaitEnabledRef.current = enabled;
          if (readingBufferMs !== undefined) typeWaitBufferRef.current = readingBufferMs;
        },
      };

      for (const step of result.steps) {
        // より新しいadvance()が既に始まっていたら、ここで静かに打ち切る。
        // (このバッチの残りのタグ処理・タイプライター表示はもう画面に
        //  反映する意味が無い = 破棄する)
        if (isStale()) return;

        for (const tag of step.tags) {
          if (isStale()) return;
          await dispatchTag(tag, handlers);
        }

        if (isStale()) return;

        if (step.content) {
          setSpeakerState(step.speaker);
          setLines((prev) => [...prev, { speaker: step.speaker, content: step.content }]);
          clearBubbleTimer();
          const fadeIn = nextRevealFadeRef.current;
          nextRevealFadeRef.current = false;
          setActiveMessageState({
            speaker: step.speaker,
            content: step.content,
            fadeIn,
            typeSpeedMs: typeSpeedRef.current,
          });

          if (typeWaitEnabledRef.current) {
            const typingMs = typeSpeedRef.current > 0 ? step.content.length * typeSpeedRef.current : 0;
            const estimatedMs = typingMs + typeWaitBufferRef.current;
            // wait()と同じ理由でこの待ち専用のcontrollerを発行する。
            if (isStale()) return;
            const controller = new AbortController();
            abortControllerRef.current = controller;
            await abortableSleep(estimatedMs, controller.signal);
          }
        }
      }

      // ここに到達した時点でstaleなら(ループ中は問題無くても、直前の
      // await中に新しいadvance()が始まっているかもしれないので念のため
      // 再チェック)、pendingGoto/visual/choicesの反映を一切せず引き返す。
      // isProcessingRef/isProcessing stateもここでは触らない
      // (それは新しい世代のadvance()が責任を持って最後に false にする)。
      if (isStale()) return;

      if (pendingGoto) {
        if (onNavigate) {
          onNavigate(pendingGoto);
        } else {
          console.warn('[useStoryEngine] goto tag encountered but no onNavigate handler was provided:', pendingGoto);
        }
      }

      if (result.visual) {
        setBg(result.visual.bg);
        // 重要: result.visual.characters は inkStepRunner.ts側が独自に
        // 追跡してる「bg/表情/モーション等の永続化用スナップショット」で、
        // gazeはそもそも追跡対象に含まれていない(モック確認用の一時的な
        // 見た目情報として扱われていたため)。ここでそのまま丸ごと
        // setCharactersすると、直前にgazeタグで設定したばかりの視線が
        // 同じバッチの中で即座に上書き・消去されてしまっていた
        // (「一瞬表示されてすぐ消える」の正体)。gazeだけは現在のstateから
        // 引き継ぐようにする。
        setCharacters((prev) => {
          const merged: Record<string, CharacterState> = {};
          for (const [name, charState] of Object.entries(result.visual.characters)) {
            merged[name] = { ...charState, gaze: prev[name]?.gaze };
          }
          return merged;
        });
        setSpeakerState(result.visual.speaker);
      }

      setChoices(result.choices);
      isProcessingRef.current = false;
      setIsProcessing(false);
    },
    [
      onNavigate,
      setAnimDirect,
      setAnimLoop,
      setAnimStop,
      setAnimSpeedHandler,
      setAnimReverse,
      setGaze,
      hideChar,
      setChoicesVisible,
      setMessageWindowVisible,
      setPos,
      setMessageMode,
      setCamera,
      shakeScreen,
      clearBubbleTimer,
    ]
  );

  const init = useCallback(async () => {
    if (isProcessingRef.current) return;
    const result = await stepProvider.init(scenario);
    await advance(result);
    setHasLoadedOnce(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, stepProvider]);

  // React 18のStrictMode(Next.jsのdevサーバーでは既定で有効)は、マウント時に
  // effectをわざと2回実行する(mount→cleanup→mountを1瞬でシミュレートする)。
  // 今までinit()にガードが無かったため、同じシナリオに対してinit()→advance()が
  // 実質2回並行して走り、2つのadvance()ループが同じReact stateやAbortController
  // 用ref(abortControllerRef)を奪い合う形になっていた。これが「リロードすると
  // たまに会話が二重に流れる」「たまに早送りになる」といった不安定さの主因。
  // シナリオごとに1回だけ実行済みかを覚えておき、2回目の呼び出しは無視する。
  const initedScenarioRef = useRef<string | null>(null);
  useEffect(() => {
    if (initedScenarioRef.current === scenario) return;
    initedScenarioRef.current = scenario;
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  const choose = useCallback(
    async (index: number) => {
      // isProcessing(State)ではなくisProcessingRefを見る。Stateは
      // コミットが非同期なので、短時間に連続でchoose()が呼ばれるケース
      // (連打、event_loopの自動choose()との競合等)では古い値のまま
      // すり抜けてしまうことがあったため、同期的に読めるref側を正とする。
      if (isProcessingRef.current) return;
      const chosen = choices.find((c) => c.index === index);
      if (chosen) setUserLine(chosen.text);

      const result = await stepProvider.choose(scenario, index);
      await advance(result);
    },
    [choices, advance, scenario, stepProvider]
  );

  // 修正メモ: 以前は choices.find(...) で「最初に見つかった1件」のtick付き
  // 選択肢しかタイマーを張っていなかった。同じ選択肢群に
  //   + [#tick:20]
  //   + [#tick:30] -> まばたき開始
  //   + [#tick:40] -> 動いて右に移動
  // のように複数のtickが並んでいる場合、Ink側で書いた順序によっては短い方の
  // タイマーが無視される(=正しく発火しない)バグになっていた。
  // 今は現在の選択肢群に含まれる「tick付きの選択肢」全部にタイマーを張り、
  // 一番早く経過したものがchoose()を呼ぶ。choose()するとchoicesが変わって
  // このeffectのcleanupが走り、残りのタイマーは自動的に全部止まる
  // (同じ基準時刻から数えている以上、複数走らせても「一番短いものが勝つ」
  // だけで済み、一時停止/再開のような複雑な管理は不要)。
  // 次の選択肢群でまた新しいtickが出てくれば、そこでまた新しくタイマーが
  // 張られる(=「一度終わったら止まり、次の場面でまた自然に再開する」という
  // 挙動がInkの構造だけで実現できている)。
  useEffect(() => {
    // event_loopパターン: この選択肢群に #interrupt 付きの選択肢があり、
    // かつ割り込み要求が保留中なら、tick待ちすら挟まず即座にそれを選ぶ。
    //
    // 重要: 保留フラグは「次に選択肢が提示されるこの1回」でしか有効ではない
    // ことにする。以前は#interrupt付き選択肢に一致した時しかクリアして
    // いなかったため、event_loopを経由しないシーン(からかう/世間話/注文等)
    // で発生したクリックの保留要求がずっと残り続け、何ターンも後に
    // たまたまsceneA_idle等の#interrupt付き選択肢に辿り着いた瞬間、
    // ユーザーが何もしていないのに突然発火する不安定な挙動になっていた。
    // ここで選択肢が更新されるたび無条件にフラグを消費/破棄することで、
    // 「直後に#interrupt地点があれば即反応、無ければ諦める」という
    // 意図通りの寿命に絞る。
    const interruptChoice = choices.find((c) => c.tags?.some((t) => t.split(':')[0] === 'interrupt'));
    const shouldFireInterrupt = Boolean(interruptChoice) && pendingInterruptRef.current;
    pendingInterruptRef.current = false;
    if (shouldFireInterrupt && interruptChoice) {
      choose(interruptChoice.index);
      return;
    }

    const tickChoices = choices.filter((c) => c.tags?.some((t) => t.split(':')[0] === 'tick'));
    if (tickChoices.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const tickChoice of tickChoices) {
      const tickTag = tickChoice.tags.find((t) => t.split(':')[0] === 'tick');
      const seconds = tickTag ? Number(tickTag.split(':')[1]) : NaN;
      if (!Number.isFinite(seconds) || seconds <= 0) continue;

      timers.push(
        setTimeout(() => {
          choose(tickChoice.index);
        }, seconds * 1000)
      );
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [choices, choose]);

  const resetStory = useCallback(async () => {
    // 進行中の古いadvance()が万一あっても、これでstale扱いにして
    // 結果を捨てさせる(reset後の内容に上書きされるのを防ぐ)。
    advanceGenerationRef.current += 1;
    abortControllerRef.current?.abort();
    pendingInterruptRef.current = false;

    setLines([]);
    setChoices([]);
    setBg('');
    setCharacters({});
    setSpeakerState('');
    setCamState({ target: '', scale: 1, originX: 50, originY: 50 });
    setUserLine('');
    setChoicesHidden(false);
    setMessageWindowHiddenState(false);
    setPositionOverrides({});
    positionOverridesRef.current = {};
    clearBubbleTimer();
    setActiveMessageState(null);

    const result = await stepProvider.reset(scenario);
    await advance(result);
  }, [advance, clearBubbleTimer, scenario, stepProvider]);

  const setContextVars = useCallback(
    async (vars: Record<string, unknown>) => {
      for (const [varName, value] of Object.entries(vars)) {
        await stepProvider.idle(scenario, varName, value);
      }
    },
    [scenario, stepProvider]
  );

  // notify()が短時間(mousemove等)に大量連続で呼ばれた場合の保険。
  // event_${name}/_seqの書き込み自体は毎回やる(データとしては欠けない)が、
  // 「実行中のwait/type_waitを打ち切る」効果の方は一定間隔に間引く。
  // 単発の本来の使い方(クリック等)ではこの間隔より間が空くのが普通なので
  // 体感には影響しない。連続的なデータをうっかりnotify()に繋いでしまっても、
  // 演出のテンポを壊す被害を最小限にするための保険。
  const WAKE_THROTTLE_MS = 50;
  const lastWakeAtRef = useRef(0);

  // 内部専用: wait/type_wait待ちを即座に打ち切り、次に#interrupt付き
  // 選択肢に到達した時点でそれを自動選択する「即時反応」トリガー。
  // 単独では公開せず、notify()から常に呼ばれる形にする
  // (「データを書く」と「即座に反応する」を分けて考える必要が無いなら
  //  notifyだけ呼べば両方やってくれる、という形に統一)。
  const wake = useCallback(() => {
    const now = Date.now();
    if (now - lastWakeAtRef.current < WAKE_THROTTLE_MS) return;
    lastWakeAtRef.current = now;
    pendingInterruptRef.current = true;
    abortControllerRef.current?.abort();
  }, []);

  // VNLayer.notify("blink", payload) 等から呼ばれる、host→ink一方向イベント通知。
  // 1. event_${name} / event_${name}_seq をink変数として書き込む(今まで通り)
  // 2. 同時に wake() して、実行中の#wait:/type_wait待ちを打ち切り、
  //    event_loop等の#interrupt付き選択肢に辿り着き次第それを即選択する
  // これにより「notifyしたのにink側が#wait:の間ずっと気づかない」を防げる。
  const notify = useCallback(
    async (eventName: string, payload: unknown = true) => {
      wake();
      const nextSeq = (eventSeqRef.current[eventName] ?? 0) + 1;
      eventSeqRef.current[eventName] = nextSeq;
      await setContextVars({
        [`event_${eventName}`]: payload,
        [`event_${eventName}_seq`]: nextSeq,
      });
    },
    [wake, setContextVars]
  );

  return {
    lines,
    choices,
    bg,
    characters,
    speaker,
    cam,
    shake,
    userLine,
    isProcessing,
    choose,
    choicesHidden,
    messageWindowHidden,
    positionOverrides,
    activeMessage,
    hasLoadedOnce,
    resetStory,
    flash,
    typeSpeedMs,
    setContextVars,
    notify,
  };
}
