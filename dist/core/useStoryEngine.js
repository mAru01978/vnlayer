'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { dispatchTag, getTagConfig } from '../tags/index';
import { getCharacterSlot } from '../tags/characterSlots';
import { getDefaultStepProvider } from './defaultStepProvider';
// フェーズ2でのポイント:
// - タグの「ラベル→実際の値」の変換(wait:long→1200ms、cam:zoom→scale1.6等)は
//   全部 tags/defs/*.ts に移った。ここのhandlersは「もう解決済みの値」を
//   受け取って状態を更新するだけで、waitDurations/camConfig等を一切知らない。
// - characterSlotsは tags/characterSlots.ts の共有ストア経由(Next.js/静的どちらの
//   起動時にも注入できる)。
// - stepProviderを渡さなかった場合は getDefaultStepProvider() (通常は
//   serverStepProvider、静的バンドルではstaticStepProviderに差し替え済み)を使う。
export function useStoryEngine(scenario, options = {}) {
    const stepProvider = options.stepProvider ?? getDefaultStepProvider();
    const onNavigate = options.onNavigate;
    const [lines, setLines] = useState([]);
    const [choices, setChoices] = useState([]);
    const [bg, setBg] = useState('');
    const [characters, setCharacters] = useState({});
    const [speaker, setSpeakerState] = useState('');
    const [cam, setCamState] = useState({ target: '', scale: 1, originX: 50, originY: 50 });
    const [shake, setShakeState] = useState({ nonce: 0, amplitude: 0, duration: 300 });
    const [userLine, setUserLine] = useState('');
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
    const transientTimerRef = useRef(null);
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
    const hideChar = useCallback((name) => {
        setCharacters((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);
    const setChoicesVisible = useCallback((visible) => {
        setChoicesHidden(!visible);
    }, []);
    const setMessageWindowVisible = useCallback((visible) => {
        setMessageWindowHiddenState(!visible);
    }, []);
    const setPos = useCallback((name, coords) => {
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
            const next = { ...prev, [name]: coords };
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
        setIsProcessing(true);
        let pendingGoto = null;
        const handlers = {
            handleFlash: (color, durationMs) => {
                setFlash({ color, durationMs });
                setTimeout(() => setFlash(null), durationMs);
            },
            setBg: (name) => setBg(name),
            setChar: (name, expression) => setCharacters((prev) => ({ ...prev, [name]: { expression } })),
            setAnim: (name, motion) => setAnimDirect(name, motion),
            setAnimLoop: (name, motion) => setAnimLoop(name, motion),
            setAnimStop: (name) => setAnimStop(name),
            setAnimSpeed: (name, speed) => setAnimSpeedHandler(name, speed),
            setAnimReverse: (name, motion) => setAnimReverse(name, motion),
            setSpeaker: (name) => setSpeakerState(name),
            onGoto: (path) => {
                pendingGoto = path;
            },
            wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
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
            for (const tag of step.tags) {
                await dispatchTag(tag, handlers);
            }
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
                    await new Promise((resolve) => setTimeout(resolve, estimatedMs));
                }
            }
        }
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
            setCharacters(result.visual.characters);
            setSpeakerState(result.visual.speaker);
        }
        setChoices(result.choices);
        setIsProcessing(false);
    }, [
        onNavigate,
        setAnimDirect,
        setAnimLoop,
        setAnimStop,
        setAnimSpeedHandler,
        setAnimReverse,
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
        const result = await stepProvider.init(scenario);
        await advance(result);
        setHasLoadedOnce(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenario, stepProvider]);
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenario]);
    const choose = useCallback(async (index) => {
        if (isProcessing)
            return;
        const chosen = choices.find((c) => c.index === index);
        if (chosen)
            setUserLine(chosen.text);
        const result = await stepProvider.choose(scenario, index);
        await advance(result);
    }, [isProcessing, choices, advance, scenario, stepProvider]);
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
    const setContextVars = useCallback(async (vars) => {
        for (const [varName, value] of Object.entries(vars)) {
            await stepProvider.idle(scenario, varName, value);
        }
    }, [scenario, stepProvider]);
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
    };
}
//# sourceMappingURL=useStoryEngine.js.map