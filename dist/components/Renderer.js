import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// 旧mockRenderer.tsxから改名(2026-08-09)。「モック(色付き四角+ラベル)」は
// もはや開発時だけの仮表示ではなく、素材未登録時の意図的なフォールバック
// 表示(VNLayer.configure({assets:{fallbackToMock:true}})で明示的にonにした
// 場合のみ有効、既定offでは代わりにAssetErrorを報告して何も描画しない)
// という位置づけに変わったため、「Mock」の名を外した。
//
// 差し替え可能な構造(StageRenderer型 + components/StageView.tsxの
// `const renderer = Renderer;`という1行だけの差し替え)自体は維持している
// (本番用の実素材レンダラーに丸ごと差し替えたい場合は、この形を保ったまま
// 新しいRendererを実装してStageView.tsx側の1行を差し替えるだけでよい)。
//
// 修正メモ(2026-08-09、「復元/StrictMode時にキャラが左上からびゅん」の修正):
// CharacterSprite/MessageBubbleの`hasPositionedRef`(初回配置か以降の移動かを
// 判定するref)が、React StrictModeの「マウント→クリーンアップ→再マウント」
// サイクルでクリーンアップ時にリセットされていなかった。1回目の(捨てられる)
// マウントでtrueになったまま2回目の(本物の)マウントに引き継がれてしまい、
// 本来は`tl.set()`で瞬間配置されるべき「本当の初回」が`tl.to()`による
// アニメーション移動として扱われ、CSSのleft/topが未設定のフレッシュな
// DOM要素(=ブラウザ既定位置、だいたい左上)から正しい位置へ「びゅん」と
// 動いて見えるバグになっていた。cleanup関数内で明示的にfalseへ戻すことで
// 修正した。
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { getBackgroundSlot, resolveSpriteSrc, shouldFallbackForSprite, subscribeSpriteAssets, getSpriteAssetsVersion, } from "../tags/spriteAssets";
import { getAnimAsset, shouldFallbackForAnim, subscribeAnimAssets, getAnimAssetsVersion, } from "../tags/animAssets";
import * as timelineManager from "../core/managers/timelineManager";
gsap.registerPlugin(useGSAP);
// components/StageView.tsxのtags/uiConfig.ts購読と同じパターン
// (version番号経由でuseSyncExternalStoreに載せる)。素材レジストリは
// VNLayer.configure({assets:{...}})やタグ経由で非同期的に更新されうるため、
// これを購読しておかないと「設定したのに画面に反映されない」不具合になる。
function useAssetsVersion() {
    useSyncExternalStore(subscribeSpriteAssets, getSpriteAssetsVersion, getSpriteAssetsVersion);
    useSyncExternalStore(subscribeAnimAssets, getAnimAssetsVersion, getAnimAssetsVersion);
}
// キャラの立ち位置(originX/originY、%)から視線ターゲット(gaze.x/gaze.y、%)への
// 向きを角度(度、-180〜180)で返す。ステージが正方形でない場合の縦横比の
// 歪みは無視した簡易計算(モック確認用としては十分)。
function computeGazeAngleDeg(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
}
// rawTargetDeg(-180〜180の生の角度)を、prevDeg(360度を超えてもよい連続値)
// から見て最短経路になるよう補正した「連続値としての」角度に変換する。
function shortestRotationTo(prevDeg, rawTargetDeg) {
    const delta = ((rawTargetDeg - prevDeg + 540) % 360) - 180;
    return prevDeg + delta;
}
const MOCK_BG_COLOR = "#333";
function resolveBgVisual(bg) {
    // 修正メモ(2026-08-13): ストーリー開始直後等、まだ一度も# s:bg:...が
    // 来ていない間はbgアトムの初期値が空文字列のまま。これは「背景未設定」
    // という正常な状態であり、素材が見つからない異常系ではないため、
    // AssetErrorを報告せず静かに何も描画しない(shouldFallbackForSprite等の
    // 呼び出し自体をスキップする)。
    if (!bg) {
        return { kind: "none" };
    }
    // 登録済みの背景素材を最優先する。
    const slot = getBackgroundSlot(bg);
    if (slot?.image) {
        return { kind: "image", src: slot.image };
    }
    if (slot?.color) {
        return { kind: "color", color: slot.color };
    }
    // 未登録時:
    // fallbackToMock=true なら汎用モック背景、
    // falseならAssetErrorを報告して何も描画しない。
    if (!shouldFallbackForSprite("bg", bg)) {
        return { kind: "none" };
    }
    return { kind: "color", color: MOCK_BG_COLOR };
}
function Background({ bg, atomKey, zIndex }) {
    useAssetsVersion();
    const ref = useRef(null);
    const tlRef = useRef(null);
    const visual = resolveBgVisual(bg);
    // 場面転換のたびに一瞬フェードインさせる(以前は一切トランジション無しの
    // 瞬時切り替えだった)。
    useGSAP(() => {
        if (tlRef.current) {
            tlRef.current.kill();
            timelineManager.unregister(atomKey, tlRef.current);
        }
        if (!ref.current)
            return;
        const tl = gsap.timeline();
        tlRef.current = tl;
        timelineManager.register(atomKey, "bg", tl);
        tl.fromTo(ref.current, { opacity: 0.4 }, { opacity: 1, duration: 0.4, ease: "power1.out", overwrite: "auto" });
        return () => {
            tl.kill();
            timelineManager.unregister(atomKey, tl);
        };
    }, [bg, atomKey]);
    if (visual.kind === "none")
        return null;
    return (_jsx("div", { ref: ref, "data-vn-key": "background", style: {
            position: "absolute",
            inset: 0,
            background: visual.kind === "color" ? visual.color : undefined,
            backgroundImage: visual.kind === "image" ? `url(${visual.src})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: zIndex,
        } }));
}
function CharacterSprite({ name, state, slot, isFocused, hasSpeaker, onClick, atomKey, }) {
    useAssetsVersion();
    const rootRef = useRef(null);
    const arrowRef = useRef(null);
    const imgRef = useRef(null);
    const videoRef = useRef(null);
    const positionTlRef = useRef(null);
    const gazeTlRef = useRef(null);
    const sequenceTlRef = useRef(null);
    const reverseTlRef = useRef(null);
    // GSAPが唯一の書き込み主体であるべき値の「今の実際の状態」をここで
    // 追跡する(Reactのstate/propsではなく、このref自身が正)。
    const hasPositionedRef = useRef(false);
    const currentRotationRef = useRef(null);
    // 表示する見た目の解決優先順位: #anim中の素材(動いている最中) >
    // #sで登録された表情ごとの静止画(手動指定 → フォルダ規約) >
    // フォールバック可否に応じたモック(色付き四角+ラベル)。
    const animAsset = getAnimAsset(name, state.expression, state.motion);
    const [imageFailed, setImageFailed] = useState(false);
    const spriteSrc = !animAsset
        ? resolveSpriteSrc(name, state.expression)
        : undefined;
    const hasRealAsset = Boolean(animAsset || (spriteSrc && !imageFailed));
    useEffect(() => {
        setImageFailed(false);
    }, [name, state.expression, spriteSrc]);
    // 修正メモ(2026-08-13): shouldFallbackForSprite/shouldFallbackForAnimは
    // 呼ばれるたびに「fallbackToMockがoffならAssetErrorを報告する」副作用を
    // 持つ。hasRealAsset(=素材が実際に解決できている)の場合はそもそも
    // フォールバック要否を判定する必要が無い(=呼んではいけない)。
    // このガードが抜けていたため、画像が正常に解決・表示できているケースでも
    // 毎回shouldFallbackForXxxが呼ばれ、「見つかっているのに見つからない」
    // という誤ったAssetErrorが報告され続けていた。
    const allowMock = hasRealAsset ||
        (state.motion
            ? shouldFallbackForAnim(name, state.motion)
            : shouldFallbackForSprite(name, state.expression));
    const gazeAngle = state.gaze
        ? computeGazeAngleDeg(slot.originX, slot.originY, state.gaze.x, state.gaze.y)
        : null;
    // 位置移動(#s:...:pos:...)。初回マウント時はgsap.set()で即座に配置し
    // (アニメーションさせない)、以後の変化だけをtweenする。CSS transitionでは
    // durationMsを反映できないため、GSAPに明示的なdurationを渡す。
    // overwrite:'auto'で、移動完了前に次の移動指示が来ても衝突なく上書きする。
    useGSAP(() => {
        if (positionTlRef.current) {
            positionTlRef.current.kill();
            timelineManager.unregister(atomKey, positionTlRef.current);
        }
        if (!rootRef.current)
            return;
        const tl = gsap.timeline();
        positionTlRef.current = tl;
        timelineManager.register(atomKey, `pos:${name}`, tl);
        if (!hasPositionedRef.current) {
            hasPositionedRef.current = true;
            tl.set(rootRef.current, {
                left: `${slot.originX}%`,
                top: `${slot.originY}%`,
            });
        }
        else {
            tl.to(rootRef.current, {
                left: `${slot.originX}%`,
                top: `${slot.originY}%`,
                duration: (slot.durationMs ?? 500) / 1000,
                ease: "power2.out",
                overwrite: "auto",
            });
        }
        return () => {
            tl.kill();
            timelineManager.unregister(atomKey, tl);
            // 修正メモ: React StrictModeのmount→cleanup→mountサイクルで、
            // 「捨てられる1回目のマウント」がここまで到達してもhasPositionedRefを
            // trueのままにしておくと、2回目の(本物の)マウントが「既に配置済み」
            // と誤判定してtl.to()(アニメーション移動)を使ってしまう。2回目の
            // DOM要素はleft/top未設定の新品なので、結果的に「左上から本来の
            // 位置までびゅんと動く」ように見えるバグになっていた。cleanup時に
            // 必ずfalseへ戻し、次にこの効果が走る時は常に「初回」として
            // tl.set()(瞬間配置)を使うようにする。
            hasPositionedRef.current = false;
        };
    }, [slot.originX, slot.originY, slot.durationMs, atomKey, name]);
    // 視線矢印の回転。transform全体ではなく、CSSの独立した`rotate`プロパティ
    // だけをtweenする(位置決め用のtranslateとは別軸なので競合しない)。
    // 初回出現時はgsap.set()で即座に向け、以後は最短経路になるよう補正した
    // 角度へtweenする(shortestRotationTo参照)。gazeが無くなったら
    // (キャラが視線を外す/矢印がアンマウントされる)、次回また現れた時に
    // 「そこから最短経路」で始められるよう、追跡している回転値をリセットする。
    useGSAP(() => {
        if (gazeTlRef.current) {
            gazeTlRef.current.kill();
            timelineManager.unregister(atomKey, gazeTlRef.current);
        }
        if (!arrowRef.current || gazeAngle === null) {
            currentRotationRef.current = null;
            return;
        }
        const isFirstAppearance = currentRotationRef.current === null;
        const prevRotation = currentRotationRef.current ?? gazeAngle;
        const targetRotation = shortestRotationTo(prevRotation, gazeAngle);
        currentRotationRef.current = targetRotation;
        const tl = gsap.timeline();
        gazeTlRef.current = tl;
        timelineManager.register(atomKey, `gaze:${name}`, tl);
        if (isFirstAppearance) {
            tl.set(arrowRef.current, { rotate: targetRotation });
        }
        else {
            tl.to(arrowRef.current, {
                rotate: targetRotation,
                duration: 0.15,
                ease: "power1.out",
                overwrite: "auto",
            });
        }
        return () => {
            tl.kill();
            timelineManager.unregister(atomKey, tl);
        };
    }, [gazeAngle, atomKey, name]);
    // #anim(sequence方式): 連番画像をコマ送りする。GSAPの`steps()`イージングは
    // 本来スプライトアニメーション向けに用意されているもので、
    // 「なめらかに補間するのではなく、指定したコマ数でカクカク切り替える」
    // 挙動をtween 1本で表現できる。コマの切り替え自体はimgRef.current.srcへの
    // 直接代入(Reactのstateには載せない、onUpdateの中でDOMを直接触るだけ)。
    useGSAP(() => {
        if (sequenceTlRef.current) {
            sequenceTlRef.current.kill();
            timelineManager.unregister(atomKey, sequenceTlRef.current);
            sequenceTlRef.current = null;
        }
        if (!animAsset ||
            animAsset.mode !== "sequence" ||
            !imgRef.current ||
            !state.motion)
            return;
        const frames = animAsset.frames;
        if (frames.length === 0)
            return;
        const fps = animAsset.fps ?? 12;
        const proxy = { frame: state.animReverse ? frames.length - 1 : 0 };
        imgRef.current.src = frames[Math.round(proxy.frame)];
        const tl = gsap.timeline({ repeat: state.animLoop ? -1 : 0 });
        sequenceTlRef.current = tl;
        timelineManager.register(atomKey, `anim:${name}`, tl);
        tl.to(proxy, {
            frame: state.animReverse ? 0 : frames.length - 1,
            duration: Math.max(frames.length / fps, 0.05),
            ease: `steps(${Math.max(frames.length - 1, 1)})`,
            onUpdate: () => {
                if (imgRef.current)
                    imgRef.current.src = frames[Math.round(proxy.frame)];
            },
        });
        tl.timeScale(Math.max(0.05, Math.abs(state.animSpeed ?? 1)));
        return () => {
            tl.kill();
            timelineManager.unregister(atomKey, tl);
        };
    }, [
        animAsset,
        state.motion,
        state.animLoop,
        state.animReverse,
        state.animSpeed,
        atomKey,
        name,
    ]);
    // #anim(single方式): webm動画を<video>で再生する。順再生・ループ・速度は
    // ネイティブのvideo要素のAPI(loop/playbackRate)に任せる方が、GSAPで毎
    // フレームcurrentTimeを進めるより軽くて滑らか。<video>がネイティブに
    // 対応していない「逆再生」だけは、pauseした状態でGSAPのtimelineが
    // currentTimeを手動で巻き戻す形で実現する。
    useGSAP(() => {
        if (reverseTlRef.current) {
            reverseTlRef.current.kill();
            timelineManager.unregister(atomKey, reverseTlRef.current);
            reverseTlRef.current = null;
        }
        const video = videoRef.current;
        if (!animAsset ||
            animAsset.mode !== "single" ||
            !animAsset.src ||
            !video ||
            !state.motion)
            return;
        const speed = Math.max(0.05, Math.abs(state.animSpeed ?? 1));
        const applyPlayback = () => {
            video.playbackRate = speed;
            if (state.animReverse) {
                video.loop = false;
                video.pause();
                const duration = video.duration || 1;
                const tl = gsap.timeline({ repeat: state.animLoop ? -1 : 0 });
                reverseTlRef.current = tl;
                timelineManager.register(atomKey, `anim:${name}`, tl);
                tl.fromTo(video, { currentTime: duration }, {
                    currentTime: 0,
                    duration: duration / speed,
                    ease: "none",
                    onRepeat: () => {
                        video.currentTime = video.duration || 0;
                    },
                });
            }
            else {
                video.loop = Boolean(state.animLoop);
                video.currentTime = 0;
                video.play().catch(() => {
                    // 自動再生ポリシーで弾かれる場合がある(muted/playsInlineを
                    // 付けてはいるが、環境依存の失敗はここで静かに無視する)。
                });
            }
        };
        if (video.readyState >= 1) {
            applyPlayback();
        }
        else {
            video.addEventListener("loadedmetadata", applyPlayback, { once: true });
        }
        return () => {
            if (reverseTlRef.current) {
                reverseTlRef.current.kill();
                timelineManager.unregister(atomKey, reverseTlRef.current);
            }
            video.removeEventListener("loadedmetadata", applyPlayback);
        };
    }, [
        animAsset,
        state.motion,
        state.animLoop,
        state.animReverse,
        state.animSpeed,
        atomKey,
        name,
    ]);
    if (!hasRealAsset && !allowMock) {
        // fallbackToMockがoffで、素材も見つからない: 何も描画しない
        // (AssetErrorは resolveSpriteSrc/shouldFallbackForSprite 経由で既に
        // 報告済み)。位置決めのuseGSAP等は引き続き走らせておく必要があるため、
        // フックの並び自体はここより前に維持し、描画だけスキップする。
        return null;
    }
    return (_jsxs(_Fragment, { children: [_jsxs("div", { ref: rootRef, onClick: onClick, "data-vn-key": `sprite:${name}`, style: {
                    position: "absolute",
                    // left/topはここでは指定しない(GSAPのgsap.set/.toだけが書き込む
                    // 唯一の主体。上のコメント参照)。
                    transform: "translate(-50%, -50%)",
                    width: 80,
                    height: 140,
                    borderRadius: 6,
                    overflow: "hidden",
                    background: hasRealAsset ? "transparent" : "#8a8a8a",
                    opacity: hasSpeaker ? (isFocused ? 1 : 0.35) : 1,
                    transition: "opacity 300ms ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    color: "#fff",
                    fontSize: 12,
                    paddingBottom: 4,
                    // 親のステージ全体はoverlayモードでpointerEvents:'none'になっている
                    // ことがあるが、キャラ個別のクリックはoverlay/full どちらでも
                    // 拾えてほしいので、onClickがある時は自分自身だけ'auto'に戻す。
                    pointerEvents: onClick ? "auto" : undefined,
                    cursor: onClick ? "pointer" : undefined,
                    zIndex: state.zIndex,
                }, children: [animAsset?.mode === "sequence" && (_jsx("img", { ref: imgRef, alt: name, style: {
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        } })), animAsset?.mode === "single" && animAsset.src && (_jsx("video", { ref: videoRef, src: animAsset.src, muted: true, playsInline: true, style: {
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        } })), !animAsset && spriteSrc && !imageFailed && (_jsx("img", { src: spriteSrc, alt: name, onError: (e) => {
                            e.currentTarget.style.display = "none";
                            setImageFailed(true);
                        }, style: {
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        } })), !hasRealAsset && (_jsxs(_Fragment, { children: [_jsx("div", { children: name }), _jsxs("div", { style: { fontSize: 10, opacity: 0.8 }, children: [state.expression, state.motion ? ` / ${state.motion}` : "", state.animLoop ? " 🔁" : "", state.animReverse ? " ⏪" : "", state.animSpeed !== undefined && state.animSpeed !== 1
                                        ? ` x${state.animSpeed}`
                                        : ""] })] }))] }), gazeAngle !== null && (_jsx("div", { ref: arrowRef, style: {
                    position: "absolute",
                    left: `${slot.originX}%`,
                    top: `${slot.originY}%`,
                    transform: "translate(-50%, -50%) translateY(-84px)",
                    // rotateはここでは指定しない(GSAPのgsap.set/.toだけが書き込む
                    // 唯一の主体。上のコメント参照)。
                    width: 0,
                    height: 0,
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    borderLeft: "14px solid #ffd54a",
                    pointerEvents: "none",
                    zIndex: state.zIndex !== undefined ? state.zIndex + 1 : 6,
                } }))] }));
}
function MessageBubble({ speaker, content, slot, revealedCount, visible, onClick, fontFamily, fontSizePx, offsetPx, atomKey, }) {
    const rootRef = useRef(null);
    const positionTlRef = useRef(null);
    const hasPositionedRef = useRef(false);
    // 修正メモ: CharacterSprite側と同じ理由(上のコメント参照)で、こちらも
    // React StrictModeのmount→cleanup→mountサイクルでhasPositionedRefが
    // trueのまま引き継がれ、「本当の初回」なのにtl.to()で左上等の未配置位置
    // から動いて見えるバグがあったため、cleanup時に必ずfalseへ戻す。
    useGSAP(() => {
        if (positionTlRef.current) {
            positionTlRef.current.kill();
            timelineManager.unregister(atomKey, positionTlRef.current);
        }
        if (!rootRef.current)
            return;
        const tl = gsap.timeline();
        positionTlRef.current = tl;
        timelineManager.register(atomKey, `bubble:${speaker}`, tl);
        if (!hasPositionedRef.current) {
            hasPositionedRef.current = true;
            tl.set(rootRef.current, {
                left: `${slot.originX}%`,
                top: `calc(${slot.originY}% - ${offsetPx}px)`,
            });
        }
        else {
            tl.to(rootRef.current, {
                left: `${slot.originX}%`,
                top: `calc(${slot.originY}% - ${offsetPx}px)`,
                duration: (slot.durationMs ?? 500) / 1000,
                ease: "power2.out",
                overwrite: "auto",
            });
        }
        return () => {
            tl.kill();
            timelineManager.unregister(atomKey, tl);
            hasPositionedRef.current = false;
        };
    }, [slot.originX, slot.originY, slot.durationMs, offsetPx, atomKey, speaker]);
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
        .vnlayer-scroll-hidden {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* 旧Edge/IE */
        }
        .vnlayer-scroll-hidden::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
      ` }), _jsxs("div", { ref: rootRef, onClick: onClick, className: "vnlayer-scroll-hidden", "data-vn-key": `message:${speaker || "narrator"}`, style: {
                    position: "absolute",
                    // left/topはここでは指定しない(GSAPのgsap.set/.toだけが書き込む
                    // 唯一の主体。CharacterSprite側のコメント参照)。
                    transform: "translate(-50%, -100%)",
                    maxWidth: 220,
                    maxHeight: "70%",
                    overflowY: "auto",
                    background: "rgba(255,255,255,0.95)",
                    color: "#111",
                    borderRadius: 12,
                    padding: "10px 14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    fontSize: fontSizePx ?? 13,
                    fontFamily,
                    lineHeight: 1.5,
                    cursor: revealedCount < content.length ? "pointer" : "default",
                    opacity: visible ? 1 : 0,
                    transition: "opacity 800ms ease",
                    zIndex: 5,
                }, children: [speaker && (_jsx("div", { style: { fontSize: 11, opacity: 0.6, marginBottom: 2 }, children: speaker })), _jsx("div", { style: { whiteSpace: "pre-wrap" }, children: content.slice(0, revealedCount) }), _jsx("div", { style: {
                            position: "absolute",
                            left: "50%",
                            bottom: -8,
                            transform: "translateX(-50%)",
                            width: 0,
                            height: 0,
                            borderLeft: "8px solid transparent",
                            borderRight: "8px solid transparent",
                            borderTop: "8px solid rgba(255,255,255,0.95)",
                        } })] })] }));
}
function NarratorCaption({ content, revealedCount, visible, onClick, fontFamily, fontSizePx, }) {
    return (_jsx("div", { onClick: onClick, "data-vn-key": "message:narrator", style: {
            position: "absolute",
            left: "50%",
            top: 14,
            transform: "translateX(-50%)",
            maxWidth: 280,
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: fontSizePx ?? 13,
            fontFamily,
            lineHeight: 1.5,
            textAlign: "center",
            cursor: revealedCount < content.length ? "pointer" : "default",
            opacity: visible ? 1 : 0,
            transition: "opacity 800ms ease",
            zIndex: 5,
        }, children: content.slice(0, revealedCount) }));
}
function ChoiceButton({ text, onClick, disabled, fontFamily, fontSizePx, index, }) {
    return (_jsx("button", { onClick: onClick, disabled: disabled, "data-vn-key": `choice:${index}`, style: {
            padding: "10px 14px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: disabled ? "#eee" : "#fff",
            color: "#111",
            cursor: disabled ? "not-allowed" : "pointer",
            textAlign: "left",
            width: "100%",
            fontSize: fontSizePx,
            fontFamily,
        }, children: text }));
}
function FlashOverlay({ color, durationMs, atomKey }) {
    const ref = useRef(null);
    const tlRef = useRef(null);
    useGSAP(() => {
        if (tlRef.current) {
            tlRef.current.kill();
            timelineManager.unregister(atomKey, tlRef.current);
        }
        if (!ref.current)
            return;
        const tl = gsap.timeline();
        tlRef.current = tl;
        timelineManager.register(atomKey, "flash", tl);
        tl.fromTo(ref.current, { opacity: 1 }, { opacity: 0, duration: durationMs / 1000, ease: "power1.out" });
        return () => {
            tl.kill();
            timelineManager.unregister(atomKey, tl);
        };
    }, [color, durationMs, atomKey]);
    return (_jsx("div", { ref: ref, style: {
            position: "absolute",
            inset: 0,
            backgroundColor: color,
            pointerEvents: "none",
            zIndex: 10,
            opacity: 1,
        } }));
}
export const Renderer = {
    Background,
    CharacterSprite,
    MessageBubble,
    NarratorCaption,
    ChoiceButton,
    FlashOverlay,
};
//# sourceMappingURL=Renderer.js.map