'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { dispatchTag, getTagConfig } from '../tags/index';
import { getCharacterSlot } from '../tags/characterSlots';
import { setUiConfig as setUiConfigStore, getUiConfig } from '../tags/uiConfig';
import { getDefaultStepProvider } from './defaultStepProvider';
import { registerInstance, unregisterInstance, emitToInstance } from './instanceRegistry';
import { resolveDomSelectorToken } from '../tags/domSelector';
import { abortableSleep } from './abortableSleep';
// フェーズ2でのポイント:
// - タグの「ラベル→実際の値」の変換(wait:long→1200ms、cam:zoom→scale1.6等)は
//   全部 tags/defs/*.ts に移った。ここのhandlersは「もう解決済みの値」を
//   受け取って状態を更新するだけで、waitDurations/camConfig等を一切知らない。
// - characterSlotsは tags/characterSlots.ts の共有ストア経由(Next.js/静的どちらの
//   起動時にも注入できる)。
// - stepProviderを渡さなかった場合は getDefaultStepProvider() (通常は
//   serverStepProvider、静的バンドルではstaticStepProviderに差し替え済み)を使う。
// - instanceIdは、このVNインスタンス自身を指す識別子(通常はmount()時の
//   selector、例: "#vn")。#ui:...タグの設定がこのインスタンスだけに
//   スコープされるようにするために使う(tags/uiConfig.ts参照)。
export function useStoryEngine(scenario, options = {}) {
    const stepProvider = options.stepProvider ?? getDefaultStepProvider();
    const onNavigate = options.onNavigate;
    const instanceId = options.instanceId;
    const [lines, setLines] = useState([]);
    const [choices, setChoices] = useState([]);
    const [bg, setBg] = useState('');
    const [characters, setCharacters] = useState({});
    const [speaker, setSpeakerState] = useState('');
    const [cam, setCamState] = useState({ target: '', scale: 1, originX: 50, originY: 50 });
    const [shake, setShakeState] = useState({ nonce: 0, amplitude: 0, duration: 300 });
    const [isProcessing, setIsProcessing] = useState(false);
    const [choicesHidden, setChoicesHidden] = useState(false);
    const [messageWindowHidden, setMessageWindowHiddenState] = useState(false);
    const [positionOverrides, setPositionOverrides] = useState({});
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [activeMessage, setActiveMessageState] = useState(null);
    const [flash, setFlash] = useState(null);
    const initialTypeSpeed = getTagConfig('type')?.speeds.normal ?? 30;
    const [typeSpeedMs, setTypeSpeedMsState] = useState(initialTypeSpeed);
    const typeSpeedRef = useRef(initialTypeSpeed);
    const nextRevealFadeRef = useRef(false);
    const typeWaitEnabledRef = useRef(false);
    const typeWaitBufferRef = useRef(1500);
    const positionOverridesRef = useRef({});
    // setBgハンドラ内でbgの変化判定に使う(state更新関数の中で別のstate更新関数を
    // 呼ぶ危険なネストを避けるため、refで持つ)。
    const bgRef = useRef('');
    const transientTimerRef = useRef(null);
    // notify()の即時反応機構: advance()の1回の呼び出し(=タグ処理のバッチ)ごとに
    // 新しいAbortControllerを張り直す。notify()が呼ばれるとabort()され、
    // 実行中のwait/type_wait推定待ちが即resolveする。
    const abortControllerRef = useRef(null);
    // 待ちを打ち切った時点でまだ #interrupt 付き選択肢に辿り着いていない場合、
    // 「即時反応の要求があった」ことだけを記録しておき、後でchoicesが更新される
    // (=event_loop等に到達する)たびにチェックして消費する。
    const pendingInterruptRef = useRef(false);
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
    const setAnimDirect = useCallback((name, motion) => {
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
    const setAnimLoop = useCallback((name, motion) => {
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
    const setAnimStop = useCallback((name) => {
        setCharacters((prev) => {
            if (!prev[name])
                return prev;
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
    const setAnimSpeedHandler = useCallback((name, speed) => {
        setCharacters((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                expression: prev[name]?.expression ?? 'normal',
                animSpeed: speed,
            },
        }));
    }, []);
    const setAnimReverse = useCallback((name, motion) => {
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
    const setGaze = useCallback((name, target) => {
        setCharacters((prev) => {
            if (!prev[name] && target === 'reset')
                return prev;
            const { gaze: _drop, ...rest } = prev[name] ?? { expression: 'normal' };
            return {
                ...prev,
                [name]: target === 'reset' ? rest : { ...rest, gaze: target },
            };
        });
    }, []);
    const hideChar = useCallback((name) => {
        setCharacters((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
        // 修正メモ: 話者が#s:name:hideで非表示になっても、以前はメッセージ
        // ウィンドウ(吹き出し)がそのまま画面に残り続けていた
        // (「キャラがいなくなっても残っちゃう」不自然さの原因)。
        // #ui:messageWindow:autoHideOnCharHide(既定on)で自動フェードアウトする。
        if (getUiConfig(instanceId).messageWindow.autoHideOnCharHide) {
            setActiveMessageState((prev) => {
                if (prev && prev.speaker === name) {
                    clearBubbleTimer();
                    return null;
                }
                return prev;
            });
        }
    }, [instanceId, clearBubbleTimer]);
    const setChoicesVisible = useCallback((visible) => {
        setChoicesHidden(!visible);
    }, []);
    const setMessageWindowVisible = useCallback((visible) => {
        setMessageWindowHiddenState(!visible);
    }, []);
    const setPos = useCallback((name, coords, durationMs) => {
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
    }, []);
    const setMessageMode = useCallback((mode, transientDurationMs) => {
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
    }, [clearBubbleTimer]);
    const setCamera = useCallback((scale, target, _durationMs) => {
        setCamState((prev) => {
            const slot = target
                ? positionOverridesRef.current[target] ?? getCharacterSlot(target) ?? { originX: prev.originX, originY: prev.originY }
                : { originX: prev.originX, originY: prev.originY };
            return { target: target ?? prev.target, scale, originX: slot.originX, originY: slot.originY };
        });
    }, []);
    const shakeScreen = useCallback((amplitude, duration) => {
        setShakeState((prev) => ({ nonce: prev.nonce + 1, amplitude, duration }));
    }, []);
    const advance = useCallback(async (result) => {
        // このバッチの世代番号。以後、他のadvance()がこれより新しい世代を
        // 発行していたら(myGeneration !== advanceGenerationRef.current)、
        // このバッチは「もう古い」と判断してState更新を止める。
        const myGeneration = ++advanceGenerationRef.current;
        const startedAt = Date.now();
        let hasWarnedStale = false;
        const isStale = () => {
            const stale = myGeneration !== advanceGenerationRef.current;
            // 診断用ログ: staleと判定された「最初の瞬間」だけ警告を出す
            // (何度もチェックが走るので、同じバッチにつき1回だけに絞る)。
            // これが出た場合、このバッチの残りの結果(setChoices/setCharacters等)は
            // 一切画面に反映されない(=バックログにはテキストが残るのに選択肢や
            // 見た目が更新されない、という現象の直接の原因がここ)。
            // どのタイミングで、このバッチが始まってから何ms後に、世代がいくつ
            // 進んだ状態で古くなったかが分かるので、何が新しいadvance()/resetStory()
            // を引き起こしたか(直前の操作)を照らし合わせて調べられる。
            if (stale && !hasWarnedStale) {
                hasWarnedStale = true;
                const firstStepWithText = result.steps.find((s) => s.content);
                console.warn(`[VNLayer] advance() batch (generation ${myGeneration}) becoming stale after ${Date.now() - startedAt}ms — a newer advance()/resetStory() (generation ${advanceGenerationRef.current}) has started. ` +
                    `This batch had ${result.steps.length} step(s), first spoken line: ` +
                    `${firstStepWithText ? `"${firstStepWithText.speaker}: ${firstStepWithText.content}"` : '(none)'}. ` +
                    `Its remaining tag/text processing already happened (visible in backlog), but its final ` +
                    `choices/visual state will NOT be applied. If this is unexpected, check what triggered a second ` +
                    `advance() (choose() call, tick timer, resetStory()) during this scene.`);
            }
            return stale;
        };
        isProcessingRef.current = true;
        setIsProcessing(true);
        let pendingGoto = null;
        const handlers = {
            handleFlash: (color, durationMs) => {
                setFlash({ color, durationMs });
                setTimeout(() => setFlash(null), durationMs);
            },
            setBg: (name) => {
                // 修正メモ: 以前はsetBg((prev) => { ...; setActiveMessageState(null); ... })
                // という、React stateの更新関数の中で別のstate更新関数を呼ぶ形に
                // なっていた。これはReactが想定していない書き方で、開発モード
                // (StrictMode)がこの更新関数を意図的に2回呼んで副作用を検出する
                // 仕組みと衝突し、bg/activeMessageの更新タイミングが噛み合わなくなって
                // 直後に出すはずのメッセージが反映されなくなるバグを引き起こしていた。
                // bgの変化判定はrefで行い、setActiveMessageStateは更新関数の外側で
                // 普通に呼ぶ形に直した。
                const changed = bgRef.current !== name;
                bgRef.current = name;
                setBg(name);
                if (changed && getUiConfig(instanceId).messageWindow.autoHideOnBgChange) {
                    clearBubbleTimer();
                    setActiveMessageState(null);
                }
            },
            setChar: (name, expression) => setCharacters((prev) => ({ ...prev, [name]: { expression } })),
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
            setUiConfig: (patch) => {
                setUiConfigStore(patch, instanceId);
            },
            onOpen: (url) => {
                if (typeof window !== 'undefined') {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            },
            // #emit:selector:varName:value タグ用。他のVNインスタンス(selector)の
            // ink変数へ一方通行で値を書き込む(VN間イベント連携)。中身はcore/
            // instanceRegistry.ts経由でそのインスタンス自身のsetContextVarsを呼ぶ。
            emit: (selector, vars, options) => emitToInstance(selector, vars, options),
            // #web:emit:eventName:value タグ用。ink変数(setContext/getContext)は
            // 一切経由せず、window.dispatchEventで直接ブラウザ側へ通知する
            // (ink→webへの一方通行の唯一の出口)。host側はwindow.addEventListenerで
            // "vnlayer:emit" を購読し、e.detail.name / e.detail.payload / 
            // e.detail.instanceId を見て振り分ける想定。
            emitToWeb: (eventName, payload) => {
                if (typeof window === 'undefined')
                    return;
                window.dispatchEvent(new CustomEvent('vnlayer:emit', { detail: { name: eventName, payload, instanceId } }));
            },
            onScroll: (target, durationMs) => {
                if (typeof window === 'undefined' || typeof document === 'undefined')
                    return;
                const n = Number(target);
                let targetY;
                if (Number.isFinite(n) && target.trim() !== '') {
                    targetY = n;
                }
                else {
                    // 修正メモ: targetがCSSセレクタとして不正な文字列(スペースを含む、
                    // 記号始まり等)だと document.querySelector が同期的に例外を投げる。
                    // #web:scrollのtargetはシナリオ制作者が手で書くink側の文字列なので、
                    // タイポ等で不正な値が来ても演出全体を巻き込んで止めないよう、
                    // ここで例外を吸収する(このtry/catchが無いと、この例外は
                    // dispatchTag→advance()まで伝播し、advance()が最後まで到達できず
                    // isProcessingRef.current=falseに戻らないまま止まる → 以後の
                    // クリックが全部「処理中」判定で弾かれ続け、操作不能になる)。
                    //
                    // targetは resolveDomSelectorToken() で .class / @id(→#id) /
                    // 裸の単語(→[data-vn-id="..."])のいずれかとして解決してから
                    // querySelectorする(tags/domSelector.ts参照。他の「DOM要素を
                    // 探す」タグ全般と解決ルールを共通化してある)。
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
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                    return;
                }
                // ブラウザ既定のsmoothスクロールには時間指定が無いため、
                // durationMs指定時だけ自前でrequestAnimationFrameアニメーションする。
                const startY = window.scrollY;
                const distance = targetY - startY;
                const start = performance.now();
                const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
                const step = (now) => {
                    const elapsed = now - start;
                    const t = Math.min(elapsed / durationMs, 1);
                    window.scrollTo(0, startY + distance * easeInOutQuad(t));
                    if (t < 1)
                        requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
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
                if (isStale())
                    return Promise.resolve();
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
                if (readingBufferMs !== undefined)
                    typeWaitBufferRef.current = readingBufferMs;
            },
        };
        for (const step of result.steps) {
            // より新しいadvance()が既に始まっていたら、ここで静かに打ち切る。
            // (このバッチの残りのタグ処理・タイプライター表示はもう画面に
            //  反映する意味が無い = 破棄する)
            if (isStale())
                return;
            for (const tag of step.tags) {
                if (isStale())
                    return;
                try {
                    await dispatchTag(tag, handlers);
                }
                catch (e) {
                    // 重要: ここで握りつぶさないと、1つのタグ実行中の例外が
                    // advance()全体をreject させ、末尾のisProcessingRef.current=false /
                    // setIsProcessing(false)に到達しないまま止まる → 以後choose()が
                    // 「処理中」判定でずっと弾かれ続け、クリックしても一切反応しなく
                    // なる(コンソールにエラーが出ていても見た目には「フリーズ」に
                    // しか見えない)。1タグ失敗しても残りの処理は続行する。
                    console.warn(`[VNLayer] tag dispatch failed, skipping this tag and continuing: "${tag}"`, e);
                }
            }
            if (isStale())
                return;
            if (step.content) {
                setSpeakerState(step.speaker);
                setLines((prev) => [...prev, { kind: 'line', speaker: step.speaker, content: step.content }]);
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
                    if (isStale())
                        return;
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
        if (isStale())
            return;
        if (pendingGoto) {
            if (onNavigate) {
                onNavigate(pendingGoto);
            }
            else {
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
                const merged = {};
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
    }, [
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
    ]);
    const init = useCallback(async () => {
        if (isProcessingRef.current)
            return;
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
    const initedScenarioRef = useRef(null);
    useEffect(() => {
        if (initedScenarioRef.current === scenario)
            return;
        initedScenarioRef.current = scenario;
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenario]);
    const choose = useCallback(async (index) => {
        // isProcessing(State)ではなくisProcessingRefを見る。Stateは
        // コミットが非同期なので、短時間に連続でchoose()が呼ばれるケース
        // (連打、event_loopの自動choose()との競合等)では古い値のまま
        // すり抜けてしまうことがあったため、同期的に読めるref側を正とする。
        if (isProcessingRef.current) {
            // tick/interrupt由来の自動choose()が、他の処理(#wait:等)の最中に
            // 弾かれるのは正常な挙動(次のtickでまた試すだけで実害が無い)。
            // ここで警告を出すと「#tick:0.1が動いてるだけ」で大量にログが
            // 埋まってしまうので、実際のユーザークリックが弾かれた場合だけ警告する。
            const isAmbient = choices
                .find((c) => c.index === index)
                ?.tags?.some((t) => t.split(':')[0] === 'tick' || t.split(':')[0] === 'interrupt');
            if (!isAmbient) {
                console.warn(`[VNLayer] choose(${index}) ignored: a previous advance() (generation ${advanceGenerationRef.current}) is still in progress.`);
            }
            return;
        }
        // 選択された瞬間に古い選択肢ボタンを即座に消す。以前はここでclearせず
        // advance()完了(次の選択肢が決まるまで)まで放置していたため、
        // 長いシーン転換中ずっと「もう選べない古い選択肢」が表示されたまま
        // になって不自然だった。#ui:choice:autoClearOnChoose(既定on)でON/OFF可能。
        if (getUiConfig(instanceId).choice.autoClearOnChoose) {
            setChoices([]);
        }
        const chosen = choices.find((c) => c.index === index);
        // 修正メモ: choose()はユーザーの実クリックだけでなく、#tickタイマーや
        // #interrupt付き選択肢による「裏方の自動選択」からも呼ばれる
        // (useStoryEngine.ts下部のtick/interrupt処理useEffect参照)。
        // 以前はここでその区別をしていなかったため、テキストの無い裏方選択肢
        // まで律儀に「[Choice] 1. 」としてバックログに記録し続けてしまい、
        // event_loop等が回るたびに空の選択肢エントリが増えていくバグになっていた。
        // 裏方選択肢(tick/interruptタグ付き)はそもそもユーザーに見えていない
        // ので、バックログにも一切記録しない。
        const isAmbientChoice = chosen?.tags?.some((t) => t.split(':')[0] === 'tick' || t.split(':')[0] === 'interrupt');
        if (chosen && !isAmbientChoice) {
            // バックログに「どの選択肢を選んだか」を記録する。番号は
            // 実際に画面に表示されていた選択肢の中での順番(1始まり)。
            // #tick/#interrupt等の裏方選択肢はユーザーに見えていないので
            // 数に含めない。
            const visibleAtChoiceTime = choices.filter((c) => !c.tags?.some((t) => t.split(':')[0] === 'tick' || t.split(':')[0] === 'interrupt'));
            const number = visibleAtChoiceTime.findIndex((c) => c.index === index) + 1;
            setLines((prev) => [...prev, { kind: 'choice', number: number > 0 ? number : 1, text: chosen.text }]);
        }
        const result = await stepProvider.choose(scenario, index);
        await advance(result);
    }, [choices, advance, scenario, stepProvider]);
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
        if (tickChoices.length === 0)
            return;
        const timers = [];
        for (const tickChoice of tickChoices) {
            const tickTag = tickChoice.tags.find((t) => t.split(':')[0] === 'tick');
            const seconds = tickTag ? Number(tickTag.split(':')[1]) : NaN;
            if (!Number.isFinite(seconds) || seconds <= 0)
                continue;
            timers.push(setTimeout(() => {
                choose(tickChoice.index);
            }, seconds * 1000));
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
        bgRef.current = '';
        setCharacters({});
        setSpeakerState('');
        setCamState({ target: '', scale: 1, originX: 50, originY: 50 });
        setChoicesHidden(false);
        setMessageWindowHiddenState(false);
        setPositionOverrides({});
        positionOverridesRef.current = {};
        clearBubbleTimer();
        setActiveMessageState(null);
        // シナリオを最初からやり直す以上、setContextで書き込んだ(exposeされた)
        // 値の写しも古い情報になるためクリアする。
        contextStoreRef.current = {};
        const result = await stepProvider.reset(scenario);
        await advance(result);
    }, [advance, clearBubbleTimer, scenario, stepProvider]);
    // notify()が短時間(mousemove等)に大量連続で呼ばれた場合の保険。
    // 値の書き込み自体は毎回やる(データとしては欠けない)が、「実行中の
    // wait/type_wait待ちを打ち切る」効果の方は一定間隔に間引く。単発の
    // 本来の使い方(クリック等)ではこの間隔より間が空くのが普通なので
    // 体感には影響しない。連続的なデータをうっかりnotify:trueで送って
    // しまっても、演出のテンポを壊す被害を最小限にするための保険。
    const WAKE_THROTTLE_MS = 50;
    const lastWakeAtRef = useRef(0);
    // 内部専用: wait/type_wait待ちを即座に打ち切り、次に#interrupt付き
    // 選択肢に到達した時点でそれを自動選択する「即時反応」トリガー。
    const wake = useCallback(() => {
        const now = Date.now();
        if (now - lastWakeAtRef.current < WAKE_THROTTLE_MS)
            return;
        lastWakeAtRef.current = now;
        pendingInterruptRef.current = true;
        abortControllerRef.current?.abort();
    }, []);
    // notify:trueで渡されたキーごとの_seq採番用(インスタンス内で永続する、
    // キー名ごとに独立したカウンタ)。以前は「event名+payload」専用の
    // notify()という別APIがseqの面倒を見ていたが、setContextVarsに統合した
    // 今は、渡されたvarsのキーそれぞれに対して自動で"${key}_seq"を生成する
    // ことで、呼び出し側は一切seqを意識しなくてよい(=notify()という別APIが
    // 本当に不要になった)。
    const contextSeqRef = useRef({});
    // api-refactor-2: getContext()はink本体(variablesState)に問い合わせるの
    // ではなく、setContextVarsで書き込まれた値の「写し」をJS側でこのローカル
    // ストアに保持しておき、そこから読む方式にした。これにより:
    //   - getContext()のたびにサーバー往復(Next.js運用時)が発生しない
    //   - expose:falseというオプションが実際に意味を持つ(=ローカルストアに
    //     反映するかどうかのフラグとして機能する)。ink本体の値をそのまま
    //     読むだけなら、そもそも「exposeするかどうか」を選べる余地が無い。
    // 想定用途: 将来追加予定の#emit特殊タグ等、内部的にsetContextVarsを
    // 呼ぶが外部(getContext)からは見えてほしくない書き込みは
    // { notify: true, expose: false } のように使う。
    const contextStoreRef = useRef({});
    // api-refactor-1/2: setContextVars(vars, options?)に一本化。
    //   setContextVars(vars)
    //     → 値をInkへ書き込み、既定(expose:true)でローカルの
    //       contextStoreにも反映する(getContext()から読めるようになる)。
    //   setContextVars(vars, { notify: true })
    //     → 上記に加え、渡した各キーに対して"${key}_seq"を自動生成・
    //       インクリメントして一緒に書き込み、同時にwake()して実行中の
    //       #wait:/type_wait待ちを即座に打ち切り、event_loop等の#interrupt付き
    //       選択肢に辿り着き次第それを自動選択する
    //       (=以前の別APIだったnotify()の役割を完全に吸収した)。
    //   setContextVars(vars, { expose: false })
    //     → Inkへは書き込むが、contextStoreには反映しない
    //       (getContext()からは見えなくなる)。
    // 変数名(vn_event_xxx等の命名規則)自体は呼び出し側が決めて渡す。
    const setContextVars = useCallback(async (vars, options) => {
        let toWrite = vars;
        if (options?.notify) {
            wake();
            const withSeq = { ...vars };
            for (const key of Object.keys(vars)) {
                const nextSeq = (contextSeqRef.current[key] ?? 0) + 1;
                contextSeqRef.current[key] = nextSeq;
                withSeq[`${key}_seq`] = nextSeq;
            }
            toWrite = withSeq;
        }
        // expose未指定は既定でtrue(setContextの基本挙動はgetContextから見える)。
        // false指定時のみローカルストアへの反映をスキップする。
        if (options?.expose !== false) {
            contextStoreRef.current = { ...contextStoreRef.current, ...toWrite };
        }
        for (const [varName, value] of Object.entries(toWrite)) {
            await stepProvider.idle(scenario, varName, value);
        }
    }, [scenario, stepProvider, wake]);
    // api-refactor-2: VNLayer.getContext()用。setContextVarsで(expose:falseで
    // なく)書き込まれた値のローカルの写しから読む。varNames省略時はストア全体を
    // 返し、指定時はその名前だけを抜き出して返す(該当キーが無ければundefined)。
    const getContextVars = useCallback(async (varNames) => {
        if (!varNames || varNames.length === 0) {
            return { ...contextStoreRef.current };
        }
        const result = {};
        for (const name of varNames) {
            result[name] = contextStoreRef.current[name];
        }
        return result;
    }, []);
    // web:emit用の自己登録: このVNインスタンスが自分のinstanceId(=mount時の
    // selector)でcore/instanceRegistry.tsに自己登録しておくことで、他の
    // VNインスタンスの#web:emit:<このinstanceId>:...タグから見つけてもらえる
    // ようになる。instanceIdが無い(mount()経由でない単純な使い方)場合は
    // 登録しない(emitのターゲットにはなれないが、それ以外の動作には影響しない)。
    useEffect(() => {
        if (!instanceId)
            return;
        registerInstance(instanceId, { setContextVars });
        return () => unregisterInstance(instanceId);
    }, [instanceId, setContextVars]);
    return {
        lines,
        choices,
        bg,
        characters,
        speaker,
        cam,
        shake,
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
        getContextVars,
        instanceId,
    };
}
//# sourceMappingURL=useStoryEngine.js.map