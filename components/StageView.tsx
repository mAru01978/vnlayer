"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useStory } from "../context/StoryContext";
import { getCharacterSlot } from "../tags/spriteAssets";
import {
  getUiConfig,
  subscribeUiConfig,
  getUiConfigVersion,
} from "../tags/uiConfig";
import {
  getGlobalBacklogEntries,
  subscribeGlobalBacklog,
} from "../core/globalBacklog";
import * as timelineManager from "../core/managers/timelineManager";
import { Renderer } from "./Renderer";

gsap.registerPlugin(useGSAP);

const renderer = Renderer;
const BUBBLE_FADE_MS = 800;

export type StageMode = "inline" | "overlay";
export type UiAnchor = "left" | "right";

export type UiVisibility = {
  backlogButton?: boolean;
  choices?: boolean;
  messageWindow?: boolean;
};

export default function StageView({
  mode = "overlay",
  uiAnchor = "right",
  showUi = true,
}: {
  mode?: StageMode;
  uiAnchor?: UiAnchor;
  showUi?: boolean | UiVisibility;
}) {
  const story = useStory();
  const [backlogOpen, setBacklogOpen] = useState(false);

  const globalBacklogEntries = useSyncExternalStore(
    subscribeGlobalBacklog,
    getGlobalBacklogEntries,
    getGlobalBacklogEntries,
  );

  // 修正メモ(2026-08-08、簡易セーブ機能追加に伴う修正): tags/uiConfig.ts
  // は以前Reactの再描画を一切トリガーしない素朴なモジュールスコープのMapで、
  // getUiConfig(...)は毎回ここで直接呼んで読むだけだった。通常再生では
  // 大量のタグ処理(≒多くのJotai atom書き込み=多くの再描画)が連鎖するため
  // 気づきにくかったが、簡易セーブからの復元(atom書き込みが最小限)や、
  // mount後に非同期でVNLayer.configure({ui:...})を呼ぶケースでは
  // 「値は更新されているのに画面に反映されない/後から突然反映される」
  // 挙動として表面化していた。値そのもの(オブジェクト参照は毎回変わる)
  // ではなく「変わったかどうか」を示すversion番号を購読することで、
  // 変化があれば必ず再描画されるようにする(下のgetUiConfig(...)呼び出し
  // 自体は今まで通り素朴な関数呼び出しのままでよい)。
  useSyncExternalStore(
    subscribeUiConfig,
    getUiConfigVersion,
    getUiConfigVersion,
  );

  type BubbleEntry = {
    content: string;
    revealedCount: number;
    visible: boolean;
    typeSpeedMs: number;
    fadeIn?: boolean;
  };
  const [bubbles, setBubbles] = useState<Record<string, BubbleEntry>>({});
  const activeSpeakerRef = useRef<string | null>(null);
  const fadeOutTimersRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeMessage = story?.activeMessage ?? null;

  useEffect(() => {
    if (activeMessage) {
      const prevSpeaker = activeSpeakerRef.current;
      const newSpeaker = activeMessage.speaker;
      activeSpeakerRef.current = newSpeaker;

      if (prevSpeaker && prevSpeaker !== newSpeaker) {
        if (fadeOutTimersRef.current[prevSpeaker])
          clearTimeout(fadeOutTimersRef.current[prevSpeaker]);
        setBubbles((prev) =>
          prev[prevSpeaker]
            ? {
                ...prev,
                [prevSpeaker]: { ...prev[prevSpeaker], visible: false },
              }
            : prev,
        );
        fadeOutTimersRef.current[prevSpeaker] = setTimeout(() => {
          setBubbles((prev) => {
            const next = { ...prev };
            delete next[prevSpeaker];
            return next;
          });
        }, BUBBLE_FADE_MS);
      }

      if (fadeOutTimersRef.current[newSpeaker]) {
        clearTimeout(fadeOutTimersRef.current[newSpeaker]);
        delete fadeOutTimersRef.current[newSpeaker];
      }
      setBubbles((prev) => ({
        ...prev,
        [newSpeaker]: {
          content: activeMessage.content,
          // 簡易セーブからの復元時、保存時点で#type:wait:onにより表示が
          // 完了していた(startRevealed:true)場合は、タイプライター演出を
          // スキップしていきなり全文表示する。それ以外(通常表示、または
          // 復元だがtype:wait:offで完了状況が不明だった場合)は従来通り
          // revealedCount:0から始める。
          revealedCount: activeMessage.startRevealed
            ? activeMessage.content.length
            : 0,
          visible: false,
          typeSpeedMs: activeMessage.typeSpeedMs ?? 30,
          fadeIn: activeMessage.fadeIn,
        },
      }));
      requestAnimationFrame(() =>
        setBubbles((prev) =>
          prev[newSpeaker]
            ? { ...prev, [newSpeaker]: { ...prev[newSpeaker], visible: true } }
            : prev,
        ),
      );
    } else {
      const speaker = activeSpeakerRef.current;
      activeSpeakerRef.current = null;
      if (!speaker) return;
      if (fadeOutTimersRef.current[speaker])
        clearTimeout(fadeOutTimersRef.current[speaker]);
      setBubbles((prev) =>
        prev[speaker]
          ? { ...prev, [speaker]: { ...prev[speaker], visible: false } }
          : prev,
      );
      fadeOutTimersRef.current[speaker] = setTimeout(() => {
        setBubbles((prev) => {
          const next = { ...prev };
          delete next[speaker];
          return next;
        });
      }, BUBBLE_FADE_MS);
    }
  }, [activeMessage]);

  useEffect(() => {
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }

    const speaker = activeMessage?.speaker;
    const text = activeMessage?.content ?? "";
    if (!speaker || !text) return;

    const speed = activeMessage?.typeSpeedMs ?? 30;
    if (speed <= 0) {
      setBubbles((prev) =>
        prev[speaker]
          ? {
              ...prev,
              [speaker]: { ...prev[speaker], revealedCount: text.length },
            }
          : prev,
      );
      return;
    }

    typeIntervalRef.current = setInterval(() => {
      setBubbles((prev) => {
        const entry = prev[speaker];
        if (!entry) return prev;
        if (entry.revealedCount >= text.length) {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          return prev;
        }
        return {
          ...prev,
          [speaker]: { ...entry, revealedCount: entry.revealedCount + 1 },
        };
      });
    }, speed);

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMessage]);

  const skipTyping = () => {
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
    const speaker = activeMessage?.speaker;
    if (!speaker) return;
    setBubbles((prev) =>
      prev[speaker]
        ? {
            ...prev,
            [speaker]: {
              ...prev[speaker],
              revealedCount: prev[speaker].content.length,
            },
          }
        : prev,
    );
  };

  const outerRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const camTlRef = useRef<gsap.core.Timeline | null>(null);
  const shakeTlRef = useRef<gsap.core.Timeline | null>(null);
  const [autoHeightPx, setAutoHeightPx] = useState<number | undefined>(
    undefined,
  );
  const isProcessingForMeasureRef = useRef(false);
  useEffect(() => {
    isProcessingForMeasureRef.current = story?.isProcessing ?? false;
  }, [story?.isProcessing]);

  const stageStickToViewport = story
    ? getUiConfig(story.instanceId).stage.stickToViewport
    : true;
  const explicitHeightPx = story
    ? getUiConfig(story.instanceId).stage.heightPx
    : undefined;

  const measureStageHeight = useCallback(() => {
    const el = outerRef.current;
    if (!el || typeof document === "undefined") return;
    const prevHeight = el.style.height;
    el.style.height = "0px";
    void el.offsetHeight;
    const measured = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    );
    el.style.height = prevHeight;
    setAutoHeightPx(measured);
  }, []);

  useEffect(() => {
    if (mode !== "overlay" || stageStickToViewport || explicitHeightPx) return;
    if (
      typeof document === "undefined" ||
      typeof ResizeObserver === "undefined"
    )
      return;

    measureStageHeight();

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new ResizeObserver(() => {
      if (isProcessingForMeasureRef.current) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(measureStageHeight, 150);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [mode, stageStickToViewport, explicitHeightPx, measureStageHeight]);

  const atomKey = story?.atomKey;
  const cam = story?.cam;
  const shake = story?.shake;

  // #cam。transformOriginは即時反映(gsap.set)、scaleだけをtweenする。
  // timeline化により「先に基準点を決めてから動かす」という2ステップの
  // 演出が1つのtimelineオブジェクトとして自然に表現できる。
  useGSAP(() => {
    if (camTlRef.current) {
      camTlRef.current.kill();
      if (atomKey) timelineManager.unregister(atomKey, camTlRef.current);
    }
    if (!camRef.current || !cam || !atomKey) return;
    const tl = gsap.timeline();
    camTlRef.current = tl;
    timelineManager.register(atomKey, "cam", tl);
    tl.set(camRef.current, {
      transformOrigin: `${cam.originX}% ${cam.originY}%`,
    }).to(camRef.current, {
      scale: cam.scale,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
    return () => {
      tl.kill();
      if (atomKey) timelineManager.unregister(atomKey, tl);
    };
  }, [cam?.scale, cam?.originX, cam?.originY, atomKey]);

  // #shake。0→-amp→+amp→-amp→0 の4区間で揺らす(以前のCSS @keyframesと
  // 同じ配分)。shake.nonceが変わるたびに新しいtimelineを組み直す。
  useGSAP(() => {
    if (shakeTlRef.current) {
      shakeTlRef.current.kill();
      if (atomKey) timelineManager.unregister(atomKey, shakeTlRef.current);
    }
    if (!shakeRef.current || !shake || shake.nonce === 0 || !atomKey) return;
    const el = shakeRef.current;
    const amp = shake.amplitude;
    const leg = shake.duration / 1000 / 4;
    const tl = gsap.timeline();
    shakeTlRef.current = tl;
    timelineManager.register(atomKey, "shake", tl);
    tl.to(el, { x: -amp, duration: leg, ease: "power1.inOut" })
      .to(el, { x: amp, duration: leg, ease: "power1.inOut" })
      .to(el, { x: -amp, duration: leg, ease: "power1.inOut" })
      .to(el, { x: 0, duration: leg, ease: "power1.inOut" });
    return () => {
      tl.kill();
      if (atomKey) timelineManager.unregister(atomKey, tl);
      gsap.set(el, { x: 0 });
    };
  }, [shake?.nonce, atomKey]);

  if (!story) return null;

  const {
    lines,
    choices,
    bg,
    characters,
    speaker,
    isProcessing,
    choose,
    choicesHidden,
    messageWindowHidden,
    positionOverrides,
    instanceId,
  } = story;

  const visibleChoices = choices.filter(
    (c: any) =>
      !c.tags?.some((t: string) =>
        ["tick", "interrupt"].includes(t.split(":")[0]),
      ),
  );

  const isOverlay = mode === "overlay";
  const anchorSide: CSSProperties =
    uiAnchor === "left" ? { left: 12 } : { right: 12 };

  const uiConfig = getUiConfig(instanceId);
  const overlayPosition: "fixed" | "absolute" = uiConfig.stage.stickToViewport
    ? "fixed"
    : "absolute";
  const choiceAnchorName = uiConfig.choice.anchor;
  const choiceAnchorSlot = choiceAnchorName
    ? (positionOverrides[choiceAnchorName] ??
      getCharacterSlot(choiceAnchorName, instanceId) ??
      null)
    : null;

  const backlogAnchorName = uiConfig.backlog.anchor;
  const backlogAnchorSlot = backlogAnchorName
    ? (positionOverrides[backlogAnchorName] ??
      getCharacterSlot(backlogAnchorName, instanceId) ??
      null)
    : null;

  const isGlobalBacklog = uiConfig.backlog.mode === "global";
  const backlogEntries = isGlobalBacklog ? globalBacklogEntries : lines;

  const uiVis: Required<UiVisibility> =
    typeof showUi === "boolean"
      ? { backlogButton: showUi, choices: showUi, messageWindow: showUi }
      : {
          backlogButton: showUi.backlogButton ?? true,
          choices: showUi.choices ?? true,
          messageWindow: showUi.messageWindow ?? true,
        };

  const effectiveHeightPx = uiConfig.stage.heightPx ?? autoHeightPx;

  const outerStyle: CSSProperties = isOverlay
    ? {
        position: overlayPosition,
        ...(uiConfig.stage.stickToViewport || !effectiveHeightPx
          ? { inset: 0 }
          : uiConfig.stage.widthPx
            ? {
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: `${uiConfig.stage.widthPx}px`,
                height: `${effectiveHeightPx}px`,
              }
            : { top: 0, left: 0, right: 0, height: `${effectiveHeightPx}px` }),
        pointerEvents: "none",
        zIndex: 50,
        fontFamily: uiConfig.font.family ?? "sans-serif",
        fontSize: uiConfig.font.sizePx,
      }
    : {
        // inline: 親ボックスに完全委譲
        position: "relative",
        width: "100%",
        height: "100%",
        fontFamily: uiConfig.font.family ?? "sans-serif",
        fontSize: uiConfig.font.sizePx,
      };

  const stageStyle: CSSProperties = isOverlay
    ? { position: "absolute", inset: 0 }
    : {
        position: "absolute",
        inset: 0, // 親(outer)の 100% 領域いっぱいに載せる
      };

  return (
    <div ref={outerRef} style={outerStyle}>
      {uiVis.backlogButton && uiConfig.backlog.show && (
        <div
          style={
            backlogAnchorSlot
              ? {
                  position: "absolute",
                  left: `${backlogAnchorSlot.originX}%`,
                  top: `calc(${backlogAnchorSlot.originY}% + ${uiConfig.backlog.offset ?? 20}px)`,
                  transform: "translateX(-50%)",
                  pointerEvents: "auto",
                  zIndex: 51,
                }
              : isOverlay
                ? {
                    position: overlayPosition,
                    ...anchorSide,
                    bottom: uiConfig.backlog.offset ?? 12,
                    pointerEvents: "auto",
                    zIndex: 51,
                  }
                : {
                    // inline: 親(outer)内の右下に固定
                    position: "absolute",
                    ...anchorSide,
                    bottom: uiConfig.backlog.offset ?? 12,
                    pointerEvents: "auto",
                    zIndex: 51,
                  }
          }
        >
          <button
            onClick={() => setBacklogOpen((v) => !v)}
            data-vn-key="backlog-button"
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid #999",
              background: "#fff",
              color: "#111",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {backlogOpen ? "バックログを閉じる" : "バックログ"}
          </button>
        </div>
      )}

      <div ref={shakeRef} style={stageStyle}>
        <renderer.Background
          bg={bg}
          atomKey={story.atomKey}
          zIndex={story.bgZIndex}
          instanceId={instanceId}
        />
        <div
          ref={camRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: isOverlay ? "none" : undefined,
          }}
        >
          {Object.entries(characters).map(([name, state]: any) => {
            const slot = positionOverrides[name] ??
              getCharacterSlot(name, instanceId) ?? { originX: 50, originY: 60 };
            const isFocused = speaker === name;
            return (
              <renderer.CharacterSprite
                key={name}
                name={name}
                state={state}
                slot={slot}
                isFocused={isFocused}
                hasSpeaker={!!speaker}
                atomKey={story.atomKey}
                instanceId={instanceId}
                onClick={
                  uiConfig.character.clickable
                    ? () =>
                        story.setContextVars(
                          { vn_event_char_click: name },
                          { notify: true },
                        )
                    : undefined
                }
              />
            );
          })}

          {story.flash && (
            <renderer.FlashOverlay
              color={story.flash.color}
              durationMs={story.flash.durationMs}
              atomKey={story.atomKey}
            />
          )}
        </div>

        {uiVis.messageWindow &&
          !messageWindowHidden &&
          Object.entries(bubbles)
            .filter(([name]) => name !== "narrator")
            .map(([name, entry]) => {
              const slot = positionOverrides[name] ??
                getCharacterSlot(name, instanceId) ?? { originX: 50, originY: 40 };
              return (
                <div
                  key={name}
                  style={isOverlay ? { pointerEvents: "auto" } : undefined}
                >
                  <renderer.MessageBubble
                    speaker={name}
                    content={entry.content}
                    slot={slot}
                    revealedCount={entry.revealedCount}
                    visible={entry.visible}
                    onClick={
                      uiConfig.messageWindow.interactive
                        ? skipTyping
                        : undefined
                    }
                    fontFamily={uiConfig.font.family}
                    fontSizePx={uiConfig.font.sizePx}
                    offsetPx={uiConfig.messageWindow.offset}
                    atomKey={story.atomKey}
                  />
                </div>
              );
            })}

        {uiVis.messageWindow && !messageWindowHidden && bubbles.narrator && (
          <div style={isOverlay ? { pointerEvents: "auto" } : undefined}>
            <renderer.NarratorCaption
              content={bubbles.narrator.content}
              revealedCount={bubbles.narrator.revealedCount}
              visible={bubbles.narrator.visible}
              onClick={
                uiConfig.messageWindow.interactive ? skipTyping : undefined
              }
              fontFamily={uiConfig.font.family}
              fontSizePx={uiConfig.font.sizePx}
            />
          </div>
        )}
      </div>

      {uiVis.backlogButton && uiConfig.backlog.show && backlogOpen && (
        <div
          className="vnlayer-scroll-hidden"
          data-vn-key="backlog-panel"
          style={
            backlogAnchorSlot
              ? {
                  position: "absolute",
                  left: `${backlogAnchorSlot.originX}%`,
                  top: `calc(${backlogAnchorSlot.originY}% + ${(uiConfig.backlog.offset ?? 20) + 36}px)`,
                  transform: "translateX(-50%)",
                  width: 280,
                  maxHeight: `calc(100% - ${backlogAnchorSlot.originY}% - ${(uiConfig.backlog.offset ?? 20) + 36}px - 8px)`,
                  overflowY: "auto",
                  pointerEvents: "auto",
                  padding: "12px 16px",
                  background: "#1e1e1e",
                  color: "#fff",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  zIndex: 51,
                }
              : {
                  position: isOverlay ? overlayPosition : "static",
                  ...(isOverlay ? anchorSide : {}),
                  bottom: isOverlay
                    ? (uiConfig.backlog.offset ?? 12) + 44
                    : undefined,
                  width: isOverlay ? 320 : undefined,
                  pointerEvents: "auto",
                  marginTop: isOverlay ? 0 : 12,
                  padding: "12px 16px",
                  background: "#1e1e1e",
                  color: "#fff",
                  borderRadius: 8,
                  maxHeight: 240,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  zIndex: 51,
                }
          }
        >
          {backlogEntries.length === 0 && (
            <div style={{ opacity: 0.5, fontSize: 12 }}>
              まだ会話がありません
            </div>
          )}
          {backlogEntries.map((line: any, i: number) => {
            const originLabel =
              isGlobalBacklog &&
              line.instanceId &&
              line.instanceId !== instanceId
                ? line.instanceId
                : null;
            return line.kind === "choice" ? (
              <div key={line.seq ?? i}>
                <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 2 }}>
                  [Choice]{originLabel ? ` (${originLabel})` : ""}
                </div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {line.number}. {line.text}
                </div>
              </div>
            ) : (
              <div key={line.seq ?? i}>
                {line.speaker && (
                  <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 2 }}>
                    [{line.speaker}]{originLabel ? ` (${originLabel})` : ""}
                  </div>
                )}
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {line.content}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {uiVis.choices && !choicesHidden && visibleChoices.length > 0 && (
        <div
          className="vnlayer-scroll-hidden"
          style={
            choiceAnchorSlot
              ? {
                  position: "absolute",
                  left: `${choiceAnchorSlot.originX}%`,
                  top: `calc(${choiceAnchorSlot.originY}% + ${uiConfig.choice.offset ?? 20}px)`,
                  transform: "translateX(-50%)",
                  width: isOverlay ? 220 : 200,
                  maxHeight: `calc(100% - ${choiceAnchorSlot.originY}% - ${uiConfig.choice.offset ?? 20}px - 8px)`,
                  overflowY: "auto",
                  pointerEvents: "auto",
                  zIndex: 51,
                }
              : {
                  position: isOverlay ? overlayPosition : "absolute",
                  ...(isOverlay ? anchorSide : anchorSide),
                  bottom: isOverlay
                    ? (uiConfig.choice.offset ?? 130)
                    : (uiConfig.choice.offset ?? 80),
                  width: isOverlay ? 280 : 220,
                  maxHeight: isOverlay ? "60vh" : "50%",
                  overflowY: "auto",
                  pointerEvents: "auto",
                  marginTop: 0,
                  zIndex: 51,
                }
          }
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: uiConfig.choice.spacing ?? 8,
            }}
          >
            {visibleChoices.map((c: any) => (
              <renderer.ChoiceButton
                key={c.index}
                index={c.index}
                text={c.text}
                onClick={() => choose(c.index)}
                disabled={isProcessing || !uiConfig.choice.interactive}
                fontFamily={uiConfig.font.family}
                fontSizePx={uiConfig.font.sizePx}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
