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
// 挙動)は生のtweenと変わらないが、こうしておくと、kill/pause/再生速度変更
// などの制御口が「timelineインスタンス1つ」に常に統一され、後から
// 「このtimelineにもう1ステップ足したい」となった時も書き方を変えずに
// 済む。このファイル全体でtimelineを基本の組み立て方にしている。
//
// 設計方針2: 作った全timelineは必ずcore/managers/timelineManager.tsに
// register(atomKey, name, timeline)する。killする時は必ず
// timelineManager.unregister()も呼ぶこと(呼ばないと#wait:timelineが
// 完了しないtimelineを待ち続ける)。
//
// 設計方針3(重要・過去のバグ修正込み): GSAPがtweenで動かすCSSプロパティ
// (left/top/rotate等)は、Reactの再描画のたびに書き換わるJSXのstyleとして
// 「も」渡してはいけない。渡してしまうと、propsが変わった瞬間にReact自身が
// 先にその値を確定値へ書き換えてしまい、直後に走るGSAPのtweenが
// 「もう目的地に着いている状態からtargetへ」tweenすることになり、
// 見た目上は移動距離ゼロ=瞬間移動になる(#s:...:pos:...が「一瞬で移動して
// しまう」不具合の原因だった)。対策として、position/rotateはマウント
// 直後だけgsap.set()で初期値を入れ、以後は一切JSXのstyleに書かず、
// GSAPのtweenだけが値を書き換える唯一の主体になるようにしている。
//
// 設計方針4(視線矢印の回転、過去のバグ修正込み): 角度は-180〜180度の
// 範囲で計算される(Math.atan2の性質上)ため、178度→-178度のように
// 符号が反転する瞬間、何も考えずにその生の値へtweenすると「一番近い道」
// ではなく「ぐるっと逆回りする」長い経路でtweenしてしまい、視線が
// キャラの周りを何度も回転して見える不具合になっていた。直前に実際に
// 設定した回転値(ラップアラウンドしていない、360度を超えてもよい
// 連続値)を覚えておき、そこから見て最短経路になるよう目標値を
// 都度補正してからtweenする。
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
    // GSAPが唯一の書き込み主体であるべき値の「今の実際の状態」をここで
    // 追跡する(Reactのstate/propsではなく、このref自身が正)。
    const hasPositionedRef = useRef(false);
    const currentRotationRef = useRef(null);
    // 表示する見た目の解決優先順位: #anim中の素材(動いている最中) >
    // #sで登録された表情ごとの静止画 > モック(色付き四角+ラベル)。
    const animAsset = getAnimAsset(name, state.expression, state.motion);
    const spriteAsset = !animAsset ? getSpriteAsset(name, state.expression) : undefined;
    const hasRealAsset = Boolean(animAsset || spriteAsset);
    const gazeAngle = state.gaze ? computeGazeAngleDeg(slot.originX, slot.originY, state.gaze.x, state.gaze.y) : null;
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
            tl.set(rootRef.current, { left: `${slot.originX}%`, top: `${slot.originY}%` });
        }
        else {
            tl.to(rootRef.current, {
                left: `${slot.originX}%`,
                top: `${slot.originY}%`,
                duration: (slot.durationMs ?? 500) / 1000,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        }
        return () => {
            tl.kill();
            timelineManager.unregister(atomKey, tl);
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
            tl.to(arrowRef.current, { rotate: targetRotation, duration: 0.15, ease: 'power1.out', overwrite: 'auto' });
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
                    // left/topはここでは指定しない(GSAPのgsap.set/.toだけが書き込む
                    // 唯一の主体。上のコメント「設計方針3」参照)。
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
                    // rotateはここでは指定しない(GSAPのgsap.set/.toだけが書き込む
                    // 唯一の主体。上のコメント「設計方針3・4」参照)。
                    width: 0,
                    height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderLeft: '14px solid #ffd54a',
                    pointerEvents: 'none',
                    zIndex: 6,
                } }))] }));
}
function MessageBubble({ speaker, content, slot, revealedCount, visible, onClick, fontFamily, fontSizePx, offsetPx, atomKey }) {
    const rootRef = useRef(null);
    const positionTlRef = useRef(null);
    const hasPositionedRef = useRef(false);
    // 修正メモ: 以前はここもCSS transitionでleft/topを動かしていた。
    // CharacterSprite側の位置移動をGSAP(power2.outイージング)に切り替えた
    // 際、こちらだけCSSの既定イージング(ease、power2.outとは形が違う
    // 曲線)のまま残してしまい、同じdurationでも移動中の位置が食い違って
    // 「キャラは滑らかに動くのに吹き出しだけ全然ついてこない/遅れて追いつく」
    // というズレが発生していた(#s:...:pos:...の指定時間を長くしても
    // ズレの見た目が目立つだけで解消しなかったのはこれが原因)。
    // CharacterSprite側と全く同じtweenパラメータ(duration/ease/overwrite)を
    // 使うことで、GSAPの同じ内部クロックに乗って完全に同じ軌道を描くように
    // した(設計方針3・CharacterSprite側のコメントも参照)。
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
            tl.set(rootRef.current, { left: `${slot.originX}%`, top: `calc(${slot.originY}% - ${offsetPx}px)` });
        }
        else {
            tl.to(rootRef.current, {
                left: `${slot.originX}%`,
                top: `calc(${slot.originY}% - ${offsetPx}px)`,
                duration: (slot.durationMs ?? 500) / 1000,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        }
        return () => {
            tl.kill();
            timelineManager.unregister(atomKey, tl);
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
      ` }), _jsxs("div", { ref: rootRef, onClick: onClick, className: "vnlayer-scroll-hidden", style: {
                    position: 'absolute',
                    // left/topはここでは指定しない(GSAPのgsap.set/.toだけが書き込む
                    // 唯一の主体。CharacterSprite側の「設計方針3」コメント参照)。
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
                    transition: 'opacity 800ms ease',
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