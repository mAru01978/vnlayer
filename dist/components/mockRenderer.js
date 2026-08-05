import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// 今の「色付きの四角+テキストラベル」の見た目一式(mock実装)。
// 素材(sprite/anim)が登録されていればそちらを優先して表示し、無ければ
// 従来通りのモック表示にフォールバックする(tags/spriteAssets.ts、
// tags/animAssets.ts参照)。
//
// アニメーション周り(GSAP導入): 位置移動・視線矢印の回転・#anim(連番画像の
// コマ送り/単一webm動画の再生)・背景のフェード・フラッシュ演出を、
// CSS transition/keyframesから GSAP のtweenへ置き換えた。
//
// 設計方針1: 単発の動きであっても、生の gsap.to()/fromTo() を直接呼ぶのでは
// なく、必ず gsap.timeline() を経由して組み立てる(tl.to(...)のように)。
// 単発tweenをtimelineの0秒目に1本積むだけなら実行結果(タイミング/非同期の
// 挙動)は生のtweenと変わらないが、こうしておくと:
//   - kill/pause/再生速度変更などの制御口が「timelineインスタンス1つ」に
//     常に統一される
//   - 後から「このtimelineにもう1ステップ足したい」となった時、
//     書き方を変えずにtl.to(...)を1行追加するだけで済む
//   - gsap.set()(即時反映)とtl.to()(tween)を同じtimeline内で順序立てて
//     並べられる
// という理由から、このファイル全体でtimelineを基本の組み立て方にしている。
//
// 設計方針2: 作った全timelineは必ずcore/managers/timelineManager.tsに
// register(atomKey, name, timeline)する。これにより#timeline:pause/resume/
// kill:@name や #wait:timeline が、このコンポーネントの中身を一切知らずに
// 演出を横断制御できる。killする時は必ず timelineManager.unregister() も
// 呼ぶこと(呼ばないと#wait:timelineが完了しないtimelineを待ち続ける)。
//
// 重要な設計原則: GSAPが直接操作する値(tweenの途中経過)はReactの
// state/atomには一切書き戻さない。refで掴んだDOM要素を直接操作するだけに
// 留め、Reactの再描画サイクルとは独立させている(コマ送り中のimg.srcの
// 差し替え、動画のcurrentTime操作等も同様)。
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getBackgroundSlot } from '../tags/backgroundSlots';
import { getSpriteAsset } from '../tags/spriteAssets';
import { getAnimAsset } from '../tags/animAssets';
import * as timelineManager from '../core/managers/timelineManager';
gsap.registerPlugin(useGSAP);
const BG_COLORS = {
    izakaya_main_day: '#f3e3c8',
    izakaya_main_evening: '#e6b06a',
    izakaya_main_night: '#2b2440',
    izakaya_main_closed: '#4a4a4a',
};
// キャラの立ち位置(originX/originY、%)から視線ターゲット(gaze.x/gaze.y、%)への
// 向きを角度(度)で返す。ステージが正方形でない場合の縦横比の歪みは無視した
// 簡易計算(モック確認用としては十分)。
function computeGazeAngleDeg(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
}
function resolveBgVisual(bg) {
    // # bg:name:color:... やVNLayer.configure({backgroundSlots})で定義された
    // 画像/色があれば最優先する(ink/JS側だけで見た目を完結できるようにする
    // ため)。画像が登録されていれば画像を、無ければ色を使う。どちらも無ければ
    // 従来通りモック用の固定テーブルにフォールバックする。
    const slot = getBackgroundSlot(bg);
    if (slot?.image)
        return { kind: 'image', src: slot.image };
    if (slot?.color)
        return { kind: 'color', color: slot.color };
    const key = bg.replace(':', '_');
    const fallback = BG_COLORS[`izakaya_main_${bg.split(':')[1] ?? bg}`] ?? BG_COLORS[key] ?? '#333';
    return { kind: 'color', color: fallback };
}
function Background({ bg, atomKey }) {
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
        timelineManager.register(atomKey, 'bg', tl);
        tl.fromTo(ref.current, { opacity: 0.4 }, { opacity: 1, duration: 0.4, ease: 'power1.out', overwrite: 'auto' });
        return () => {
            tl.kill();
            timelineManager.unregister(atomKey, tl);
        };
    }, [bg, atomKey]);
    return (_jsx("div", { ref: ref, style: {
            position: 'absolute',
            inset: 0,
            background: visual.kind === 'color' ? visual.color : undefined,
            backgroundImage: visual.kind === 'image' ? `url(${visual.src})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        } }));
}
function CharacterSprite({ name, state, slot, isFocused, hasSpeaker, onClick, atomKey }) {
    const rootRef = useRef(null);
    const arrowRef = useRef(null);
    const imgRef = useRef(null);
    const videoRef = useRef(null);
    const positionTlRef = useRef(null);
    const gazeTlRef = useRef(null);
    const sequenceTlRef = useRef(null);
    const reverseTlRef = useRef(null);
    // 表示する見た目の解決優先順位: #anim中の素材(動いている最中) >
    // #sで登録された表情ごとの静止画 > モック(色付き四角+ラベル)。
    const animAsset = getAnimAsset(name, state.expression, state.motion);
    const spriteAsset = !animAsset ? getSpriteAsset(name, state.expression) : undefined;
    const hasRealAsset = Boolean(animAsset || spriteAsset);
    const gazeAngle = state.gaze ? computeGazeAngleDeg(slot.originX, slot.originY, state.gaze.x, state.gaze.y) : null;
    // 位置移動(#s:...:pos:...)。CSS transitionではdurationMsを反映できない
    // ため、GSAPに明示的なdurationを渡す。overwrite:'auto'で、移動完了前に
    // 次の移動指示が来ても衝突なく上書きする。
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
        tl.to(rootRef.current, {
            left: `${slot.originX}%`,
            top: `${slot.originY}%`,
            duration: (slot.durationMs ?? 500) / 1000,
            ease: 'power2.out',
            overwrite: 'auto',
        });
        return () => {
            tl.kill();
            timelineManager.unregister(atomKey, tl);
        };
    }, [slot.originX, slot.originY, slot.durationMs, atomKey, name]);
    // 視線矢印の回転。transform全体ではなく、CSSの独立した`rotate`プロパティ
    // だけをtweenする(位置決め用のtranslateとは別軸なので競合しない)。
    useGSAP(() => {
        if (gazeTlRef.current) {
            gazeTlRef.current.kill();
            timelineManager.unregister(atomKey, gazeTlRef.current);
        }
        if (!arrowRef.current || gazeAngle === null)
            return;
        const tl = gsap.timeline();
        gazeTlRef.current = tl;
        timelineManager.register(atomKey, `gaze:${name}`, tl);
        tl.to(arrowRef.current, { rotate: gazeAngle, duration: 0.15, ease: 'power1.out', overwrite: 'auto' });
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
        if (!animAsset || animAsset.mode !== 'sequence' || !imgRef.current || !state.motion)
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
    }, [animAsset, state.motion, state.animLoop, state.animReverse, state.animSpeed, atomKey, name]);
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
        if (!animAsset || animAsset.mode !== 'single' || !video || !state.motion)
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
                    ease: 'none',
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
            video.addEventListener('loadedmetadata', applyPlayback, { once: true });
        }
        return () => {
            if (reverseTlRef.current) {
                reverseTlRef.current.kill();
                timelineManager.unregister(atomKey, reverseTlRef.current);
            }
            video.removeEventListener('loadedmetadata', applyPlayback);
        };
    }, [animAsset, state.motion, state.animLoop, state.animReverse, state.animSpeed, atomKey, name]);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { ref: rootRef, onClick: onClick, style: {
                    position: 'absolute',
                    left: `${slot.originX}%`,
                    top: `${slot.originY}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 80,
                    height: 140,
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: hasRealAsset ? 'transparent' : '#8a8a8a',
                    opacity: hasSpeaker ? (isFocused ? 1 : 0.35) : 1,
                    transition: 'opacity 300ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    color: '#fff',
                    fontSize: 12,
                    paddingBottom: 4,
                    // 親のステージ全体はoverlayモードでpointerEvents:'none'になっている
                    // ことがあるが、キャラ個別のクリックはoverlay/full どちらでも
                    // 拾えてほしいので、onClickがある時は自分自身だけ'auto'に戻す。
                    pointerEvents: onClick ? 'auto' : undefined,
                    cursor: onClick ? 'pointer' : undefined,
                }, children: [animAsset?.mode === 'sequence' && (_jsx("img", { ref: imgRef, alt: name, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })), animAsset?.mode === 'single' && (_jsx("video", { ref: videoRef, src: animAsset.src, muted: true, playsInline: true, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })), !animAsset && spriteAsset && (_jsx("img", { src: spriteAsset.src, alt: name, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })), !hasRealAsset && (_jsxs(_Fragment, { children: [_jsx("div", { children: name }), _jsxs("div", { style: { fontSize: 10, opacity: 0.8 }, children: [state.expression, state.motion ? ` / ${state.motion}` : '', state.animLoop ? ' 🔁' : '', state.animReverse ? ' ⏪' : '', state.animSpeed !== undefined && state.animSpeed !== 1 ? ` x${state.animSpeed}` : ''] })] }))] }), gazeAngle !== null && (_jsx("div", { ref: arrowRef, style: {
                    position: 'absolute',
                    left: `${slot.originX}%`,
                    top: `${slot.originY}%`,
                    transform: 'translate(-50%, -50%) translateY(-84px)',
                    rotate: `${gazeAngle}deg`,
                    width: 0,
                    height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderLeft: '14px solid #ffd54a',
                    pointerEvents: 'none',
                    zIndex: 6,
                } }))] }));
}
function MessageBubble({ speaker, content, slot, revealedCount, visible, onClick, fontFamily, fontSizePx, offsetPx }) {
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
        .vnlayer-scroll-hidden {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* 旧Edge/IE */
        }
        .vnlayer-scroll-hidden::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
      ` }), _jsxs("div", { onClick: onClick, className: "vnlayer-scroll-hidden", style: {
                    position: 'absolute',
                    left: `${slot.originX}%`,
                    top: `calc(${slot.originY}% - ${offsetPx}px)`,
                    transform: 'translate(-50%, -100%)',
                    maxWidth: 220,
                    maxHeight: '70%',
                    overflowY: 'auto',
                    background: 'rgba(255,255,255,0.95)',
                    color: '#111',
                    borderRadius: 12,
                    padding: '10px 14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    fontSize: fontSizePx ?? 13,
                    fontFamily,
                    lineHeight: 1.5,
                    cursor: revealedCount < content.length ? 'pointer' : 'default',
                    opacity: visible ? 1 : 0,
                    transition: `opacity 800ms ease, left ${slot.durationMs ?? 500}ms ease, top ${slot.durationMs ?? 500}ms ease`,
                    zIndex: 5,
                }, children: [speaker && _jsx("div", { style: { fontSize: 11, opacity: 0.6, marginBottom: 2 }, children: speaker }), _jsx("div", { style: { whiteSpace: 'pre-wrap' }, children: content.slice(0, revealedCount) }), _jsx("div", { style: {
                            position: 'absolute',
                            left: '50%',
                            bottom: -8,
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: '8px solid rgba(255,255,255,0.95)',
                        } })] })] }));
}
function NarratorCaption({ content, revealedCount, visible, onClick, fontFamily, fontSizePx }) {
    return (_jsx("div", { onClick: onClick, style: {
            position: 'absolute',
            left: '50%',
            top: 14,
            transform: 'translateX(-50%)',
            maxWidth: 280,
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: fontSizePx ?? 13,
            fontFamily,
            lineHeight: 1.5,
            textAlign: 'center',
            cursor: revealedCount < content.length ? 'pointer' : 'default',
            opacity: visible ? 1 : 0,
            transition: 'opacity 800ms ease',
            zIndex: 5,
        }, children: content.slice(0, revealedCount) }));
}
function ChoiceButton({ text, onClick, disabled, fontFamily, fontSizePx }) {
    return (_jsx("button", { onClick: onClick, disabled: disabled, style: {
            padding: '10px 14px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: disabled ? '#eee' : '#fff',
            color: '#111',
            cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            width: '100%',
            fontSize: fontSizePx,
            fontFamily,
        }, children: text }));
}
function FlashOverlay({ color, durationMs, atomKey }) {
    const ref = useRef(null);
    const tlRef = useRef(null);
    // 以前は<style>タグに毎回新しい@keyframes名(nonce相当)を注入して
    // フェードアウトさせていたが、GSAPなら要素をtweenするだけで済み、
    // <style>の動的注入が不要になった。
    useGSAP(() => {
        if (tlRef.current) {
            tlRef.current.kill();
            timelineManager.unregister(atomKey, tlRef.current);
        }
        if (!ref.current)
            return;
        const tl = gsap.timeline();
        tlRef.current = tl;
        timelineManager.register(atomKey, 'flash', tl);
        tl.fromTo(ref.current, { opacity: 1 }, { opacity: 0, duration: durationMs / 1000, ease: 'power1.out' });
        return () => {
            tl.kill();
            timelineManager.unregister(atomKey, tl);
        };
    }, [color, durationMs, atomKey]);
    return (_jsx("div", { ref: ref, style: {
            position: 'absolute',
            inset: 0,
            backgroundColor: color,
            pointerEvents: 'none',
            zIndex: 10,
            opacity: 1,
        } }));
}
export const mockRenderer = {
    Background,
    CharacterSprite,
    MessageBubble,
    NarratorCaption,
    ChoiceButton,
    FlashOverlay,
};
//# sourceMappingURL=mockRenderer.js.map