"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { dispatchTag } from "../tags/index";
import {
  getUiConfig,
  getAllUiConfigPatches,
  restoreUiConfigPatches,
} from "../tags/uiConfig";
import {
  getAllCharacterSlots,
  getAllBackgroundSlots,
  setSpriteAssets,
} from "../tags/spriteAssets";
import { getDefaultStepProvider } from "./defaultStepProvider";
import {
  registerInstance,
  unregisterInstance,
  registerSelf,
  unregisterSelf,
} from "./instanceRegistry";
import { getStore } from "./store";
import {
  camAtomFamily,
  shakeAtomFamily,
  flashAtomFamily,
  typeSpeedAtomFamily,
  disposeBasicAtoms,
} from "./atoms";
import * as backgroundManager from "./managers/backgroundManager";
import * as characterManager from "./managers/characterManager";
import * as speakerManager from "./managers/speakerManager";
import * as positionManager from "./managers/positionManager";
import * as messageManager from "./managers/messageManager";
import * as choiceManager from "./managers/choiceManager";
import * as backlogManager from "./managers/backlogManager";
import * as windowVisibilityManager from "./managers/windowVisibilityManager";
import * as typeManager from "./managers/typeManager";
import * as navigationManager from "./managers/navigationManager";
import * as waitManager from "./managers/waitManager";
import * as contextManager from "./managers/contextManager";
import * as timelineManager from "./managers/timelineManager";
import * as interruptManager from "./managers/interruptManager";
import { TagDispatchError, StoryRuntimeError, reportError } from "./errors";
import { getDefaultSaveProvider } from "./defaultSaveProvider";
// タグシステム大改修フェーズ3: 「useStoryEngine.tsの責務過多を解消し、タグ
// 追加のたびにここを改修しなくて済むようにする」という狙いで全面的に
// 書き直した。
//
// 以前はここに「状態(useState)一式」+「25個のメソッドを持つhandlers
// オブジェクトの実装」が全部ベタ書きされていて、新しいタグを追加するには
// 大抵このファイルにも手を入れる必要があった。今は:
//   - 状態の実体(atom)と、それを書き換えるロジックは core/managers/ 以下の
//     各マネージャーファイルが所有する。
//   - タグ定義ファイル(tags/defs/{basic,special}/*.ts)は、そのマネージャーを
//     直接importして呼ぶ(このファイルのhandlersを経由しない)。
//   - GSAPのtimeline(演出そのもの)もcore/managers/timelineManager.tsが
//     一元管理する。このファイルは演出の中身を一切知らない。
//   - #interrupt(SwitchFlow経由の割り込み)もcore/managers/interruptManager.ts
//     が状態(許可/pending/キュー)を持ち、実際のStory操作は各StepProvider
//     実装(staticStepProvider.ts等)側で行う。このファイルは
//     stepProvider.onPush()を購読して、割り込みで発生したRunResultを
//     通常のadvance()経由でタグ処理・バックログ等へ反映するだけ。
//   - このファイルは「ink進行(init/choose/reset)ループの制御」+
//     「各atomをuseAtomValueで読んでReactに繋ぐ」+「文章行が来た時に
//     messageManager/backlogManagerへ通知する」だけに専念する、薄い
//     調整役になっている。
//
// atomKey/instanceIdの使い分けについては tags/registry.ts 冒頭のコメント
// 参照。ざっくり言うと:
//   atomKey    … このVNインスタンス専用の状態を隔離するためだけのキー
//                (instanceId未指定時はuseId()のフォールバック値)。
//                GSAPのtimelineManagerもこれで隔離する。#interruptの
//                StepProvider側でのStory分離キーとしても使う
//                (core/staticStepProvider.ts参照)。
//   instanceId … mount()時に渡した公開スコープ識別子。#ui:...の設定範囲や
//                全VN共通バックログの判定等、「未指定=グローバル」という
//                意味を持つ場面で使う(atomKeyとは別物)。
export function useStoryEngine(clip, options = {}) {
  const stepProvider = options.stepProvider ?? getDefaultStepProvider();
  const saveProvider =
    options.saveProvider === null
      ? null
      : (options.saveProvider ?? getDefaultSaveProvider());
  const onNavigate = options.onNavigate;
  const instanceId = options.instanceId;
  const fallbackAtomKey = useId();
  const atomKey = instanceId ?? fallbackAtomKey;
  // 状態は全部各マネージャー(またはbasicタグ専用atom)から読むだけ。
  // 書き込みはタグ(basic/special問わず)か、このフック自身(ink進行に
  // 伴う同期処理)がマネージャー関数を呼んで行う。
  const bg = useAtomValue(backgroundManager.bgAtomFamily(atomKey));
  const characters = useAtomValue(
    characterManager.charactersAtomFamily(atomKey),
  );
  const speaker = useAtomValue(speakerManager.speakerAtomFamily(atomKey));
  const cam = useAtomValue(camAtomFamily(atomKey));
  const shake = useAtomValue(shakeAtomFamily(atomKey));
  const flash = useAtomValue(flashAtomFamily(atomKey));
  const typeSpeedMs = useAtomValue(typeSpeedAtomFamily(atomKey));
  const positionOverrides = useAtomValue(
    positionManager.positionOverridesAtomFamily(atomKey),
  );
  const activeMessage = useAtomValue(
    messageManager.activeMessageAtomFamily(atomKey),
  );
  const choices = useAtomValue(choiceManager.choicesAtomFamily(atomKey));
  const choicesHidden = useAtomValue(
    choiceManager.choicesHiddenAtomFamily(atomKey),
  );
  const lines = useAtomValue(backlogManager.linesAtomFamily(atomKey));
  const messageWindowHidden = useAtomValue(
    windowVisibilityManager.messageWindowHiddenAtomFamily(atomKey),
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  // isProcessing(React state)は非同期にしかコミットされないため、
  // 「短時間に連続でinit()/choose()が呼ばれる」ケース(StrictModeの二重
  // effect実行、素早い連打、event_loopの自動choose()との競合等)で
  // 古い値を読んですり抜けてしまうことがあった。同期的に読み書きできる
  // ref側を「本物のロック」として使い、setIsProcessing(state)の方は
  // 画面表示(ボタンのdisabled等)用の見た目の値として残す。
  const isProcessingRef = useRef(false);
  const advance = useCallback(
    async (result) => {
      // バッチの世代管理・中断可能な待ちは全部core/managers/waitManager.tsに
      // 委譲している。isStale()は「自分より新しいbatchが始まっていないか」を
      // 随時チェックするためのクロージャ。
      const myGeneration = waitManager.beginBatch(atomKey);
      const isStale = () => waitManager.isStale(atomKey, myGeneration);
      isProcessingRef.current = true;
      setIsProcessing(true);
      // タグへ渡す「識別子だけ」のhandlers。実際の状態変更はタグ定義側が
      // core/managers/を直接呼んで行うので、ここでメソッドを実装する必要が
      // 無い(=新しいタグを追加してもこの関数は変更不要)。
      const handlers = { atomKey, instanceId };
      for (const step of result.steps) {
        if (isStale()) return;
        for (const tag of step.tags) {
          if (isStale()) return;
          try {
            await dispatchTag(tag, handlers);
          } catch (e) {
            // 重要: ここで握りつぶさないと、1つのタグ実行中の例外がadvance()
            // 全体をrejectさせ、末尾のisProcessingRef.current=false /
            // setIsProcessing(false)に到達しないまま止まる → 以後choose()が
            // 「処理中」判定でずっと弾かれ続け、クリックしても一切反応しなく
            // なる。1タグ失敗しても残りの処理は続行する。
            reportError(
              new TagDispatchError(
                `tag dispatch failed, skipping this tag and continuing: "${tag}"`,
                { cause: e },
              ),
            );
          }
        }
        if (isStale()) return;
        if (step.content) {
          speakerManager.setSpeaker(atomKey, step.speaker);
          backlogManager.pushLine(
            atomKey,
            instanceId,
            step.speaker,
            step.content,
          );
          const currentTypeSpeed = typeManager.getTypeSpeed(atomKey);
          messageManager.showMessage(
            atomKey,
            step.speaker,
            step.content,
            currentTypeSpeed,
          );
          if (typeManager.isTypeWaitEnabled(atomKey)) {
            const typingMs =
              currentTypeSpeed > 0 ? step.content.length * currentTypeSpeed : 0;
            const estimatedMs =
              typingMs + typeManager.getTypeWaitBufferMs(atomKey);
            if (isStale()) return;
            await waitManager.wait(atomKey, estimatedMs);
          }
        }
      }
      if (isStale()) return;
      const pendingGoto = navigationManager.consumePendingGoto(atomKey);
      if (pendingGoto) {
        if (onNavigate) {
          onNavigate(pendingGoto);
        } else {
          console.warn(
            "[useStoryEngine] goto tag encountered but no onNavigate handler was provided:",
            pendingGoto,
          );
        }
      }
      if (result.visual) {
        backgroundManager.restoreBackground(atomKey, result.visual.bg);
        characterManager.mergeVisualSnapshot(atomKey, result.visual.characters);
        speakerManager.setSpeaker(atomKey, result.visual.speaker);
      }
      choiceManager.setChoices(atomKey, result.choices);
      isProcessingRef.current = false;
      setIsProcessing(false);
      // 簡易セーブ機能: このバッチの処理が終わるたびに、対応していれば
      // (StepProvider.getSaveData実装あり、かつsaveProviderが設定されている
      // 場合)現在のink実行状態を保存する。UIをブロックしないよう
      // fire-and-forgetで行う(セーブ失敗はエラー報告するだけで進行は止めない)。
      if (saveProvider && stepProvider.getSaveData) {
        stepProvider
          .getSaveData(clip, atomKey)
          .then((storySave) => {
            if (!storySave) return;
            return saveProvider.save(clip, {
              clip,
              inkStateJson: storySave.inkStateJson,
              visual: storySave.visual,
              contextVars: contextManager.getContextVars(atomKey),
              positionOverrides: positionManager.getPositionOverrides(atomKey),
              uiConfigPatches: getAllUiConfigPatches(),
              characterSlots: getAllCharacterSlots(),
              backgroundSlots: getAllBackgroundSlots(),
              activeMessage: (() => {
                const current = messageManager.getActiveMessage(atomKey);
                if (!current) return null;
                // #type:wait:onで表示完了を待っていた(=advance()がこの
                // メッセージのタイプ推定時間ぶんawait済み)場合だけ、
                // 「保存時点で表示完了していた」とみなす。type:wait:offの
                // 場合はプレイヤーが実際どこまで読み終えていたか分からない
                // ため、安全側(最初からタイプさせ直す)に倒す。
                return {
                  ...current,
                  startRevealed: typeManager.isTypeWaitEnabled(atomKey),
                };
              })(),
              backlogLines: backlogManager.getLines(atomKey),
              savedAt: Date.now(),
            });
          })
          .catch((e) => {
            reportError(
              new StoryRuntimeError("failed to persist save data", {
                cause: e,
              }),
            );
          });
      }
    },
    [atomKey, instanceId, onNavigate, clip, stepProvider, saveProvider],
  );
  const init = useCallback(async () => {
    if (isProcessingRef.current) return;
    let result = null;
    let restoredMessage;
    // 簡易セーブ機能: 対応していれば(StepProvider.restore実装あり、かつ
    // saveProviderが設定されている場合)まず保存済みデータからの復元を試みる。
    // 復元に失敗しても致命的エラーにはせず、通常のinit()にフォールバックする
    // (壊れたセーブデータのせいで二度と開けなくなる、という事故を避けるため)。
    if (saveProvider && stepProvider.restore) {
      try {
        const saved = await saveProvider.load(clip);
        if (saved && saved.clip === clip) {
          result = await stepProvider.restore(clip, saved, atomKey);
          contextManager.hydrate(atomKey, saved.contextVars ?? {});
          // ink実行状態(state.ToJson())には含まれない、タグの累積副作用を
          // 復元する。順序上、下のadvance(result)がatom書き込み経由で
          // StageViewの再描画を引き起こすため、この時点で値を確定させて
          // おけば復元直後の1フレーム目から正しい見た目になる。
          positionManager.restore(atomKey, saved.positionOverrides ?? {});
          restoreUiConfigPatches(saved.uiConfigPatches);
          // 素材統合(2026-08-09)により、保存された立ち位置/背景定義は
          // 統合済みspriteレジストリ(tags/spriteAssets.ts)へ書き戻す形に
          // 変換する(SaveData自体のフラットな形は変更していない)。
          if (saved.characterSlots) {
            const patch = {};
            for (const [name, slot] of Object.entries(saved.characterSlots)) {
              patch[name] = { originX: slot.originX, originY: slot.originY };
            }
            setSpriteAssets(patch);
          }
          if (saved.backgroundSlots) {
            const variants = {};
            for (const [bgName, slot] of Object.entries(
              saved.backgroundSlots,
            )) {
              variants[bgName] = { color: slot.color, src: slot.image };
            }
            setSpriteAssets({ bg: { variants } });
          }
          backlogManager.restore(atomKey, instanceId, saved.backlogLines ?? []);
          // activeMessageはadvance(result)より後に反映する(advance()自体は
          // result.steps=[]なのでshowMessage()は呼ばれず競合しないが、
          // 順序を明確にするため後段でまとめて処理する)。
          restoredMessage = saved.activeMessage ?? null;
        }
      } catch (e) {
        reportError(
          new StoryRuntimeError(
            "failed to restore from save data, starting fresh instead",
            { cause: e },
          ),
        );
        result = null;
        restoredMessage = undefined;
      }
    }
    if (!result) {
      result = await stepProvider.init(clip, atomKey);
    }
    await advance(result);
    if (restoredMessage !== undefined) {
      // タイプ中(startRevealed:false)なら最初からタイプさせ直し、
      // 表示完了済み(startRevealed:true)または#type:wait:offで完了状態が
      // 不明な場合は既定のfalse(=最初からタイプ)を使う(core/managers/
      // messageManager.tsのshowMessage()と揃えたデフォルト)。
      // 実際の即時全文表示/タイプし直しの分岐はcomponents/StageView.tsx側。
      messageManager.restoreMessage(atomKey, restoredMessage);
    }
    setHasLoadedOnce(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip, stepProvider]);
  // React 18のStrictMode(Next.jsのdevサーバーでは既定で有効)は、マウント時に
  // effectをわざと2回実行する(mount→cleanup→mountを1瞬でシミュレートする)。
  // クリップごとに1回だけ実行済みかを覚えておき、2回目の呼び出しは無視する。
  const initedClipRef = useRef(null);
  useEffect(() => {
    if (initedClipRef.current === clip) return;
    initedClipRef.current = clip;
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip]);
  // #interrupt(SwitchFlow経由の割り込み)は、init/choose/resetのレスポンスを
  // 介さず非同期に新しいRunResultをpushしてくる(core/managers/interruptManager.ts
  // 参照)。対応しているStepProvider実装(現状はstaticStepProviderのみ、
  // core/serverStepProvider.tsは未対応)であれば購読しておき、pushされたら
  // 通常のadvance()経由でタグ処理・バックログ等へ反映する。
  useEffect(() => {
    if (!stepProvider.onPush) return;
    const unsubscribe = stepProvider.onPush(atomKey, (result) => {
      advance(result);
    });
    return () => unsubscribe();
  }, [stepProvider, atomKey, advance]);
  const choose = useCallback(
    async (index) => {
      // isProcessing(State)ではなくisProcessingRefを見る。Stateはコミットが
      // 非同期なので、短時間に連続でchoose()が呼ばれるケースでは古い値の
      // まますり抜けてしまうことがあったため、同期的に読めるref側を正とする。
      if (isProcessingRef.current) {
        const isAmbient = choices
          .find((c) => c.index === index)
          ?.tags?.some(
            (t) =>
              t.split(":")[0] === "tick" || t.split(":")[0] === "interrupt",
          );
        if (!isAmbient) {
          console.warn(
            `[VNLayer] choose(${index}) ignored: a previous advance() is still in progress.`,
          );
        }
        return;
      }
      if (getUiConfig(instanceId).choice.autoClearOnChoose) {
        choiceManager.setChoices(atomKey, []);
      }
      const chosen = choices.find((c) => c.index === index);
      const isAmbientChoice = chosen?.tags?.some(
        (t) => t.split(":")[0] === "tick" || t.split(":")[0] === "interrupt",
      );
      if (chosen && !isAmbientChoice) {
        const visibleAtChoiceTime = choices.filter(
          (c) =>
            !c.tags?.some(
              (t) =>
                t.split(":")[0] === "tick" || t.split(":")[0] === "interrupt",
            ),
        );
        const number =
          visibleAtChoiceTime.findIndex((c) => c.index === index) + 1;
        backlogManager.pushChoice(
          atomKey,
          instanceId,
          number > 0 ? number : 1,
          chosen.text,
        );
      }
      const result = await stepProvider.choose(clip, index, atomKey);
      await advance(result);
    },
    [choices, advance, clip, stepProvider, atomKey, instanceId],
  );
  // tick/interrupt(event_loopパターン)の自動choose()。
  useEffect(() => {
    // 保留フラグは「次に選択肢が提示されるこの1回」でしか有効ではないため、
    // 選択肢が更新されるたび無条件に消費/破棄する(waitManager.
    // consumePendingInterrupt()自体が読み取りと同時にfalseへ戻す)。
    const hadPendingInterrupt = waitManager.consumePendingInterrupt(atomKey);
    const interruptChoice = choices.find((c) =>
      c.tags?.some((t) => t.split(":")[0] === "interrupt"),
    );
    if (interruptChoice && hadPendingInterrupt) {
      // 実際に#interrupt付き選択肢へ割り込む、この瞬間だけ演出中の全
      // GSAP timelineを一時停止する(notify:trueの全呼び出しで毎回pauseする
      // と、gazeのようにnotify経由で頻繁に更新される演出がカクつくため、
      // ここに絞った。core/managers/waitManager.tsのinterrupt()のコメント
      // 参照)。割り込み処理(このchoose()が引き起こすadvance())が完了した
      // タイミングで再開する。
      timelineManager.pauseAll(atomKey);
      choose(interruptChoice.index).then(() => {
        timelineManager.resumeAll(atomKey);
      });
      return;
    }
    const tickChoices = choices.filter((c) =>
      c.tags?.some((t) => t.split(":")[0] === "tick"),
    );
    if (tickChoices.length === 0) return;
    const timers = [];
    for (const tickChoice of tickChoices) {
      const tickTag = tickChoice.tags.find((t) => t.split(":")[0] === "tick");
      const seconds = tickTag ? Number(tickTag.split(":")[1]) : NaN;
      if (!Number.isFinite(seconds) || seconds <= 0) continue;
      timers.push(
        setTimeout(() => {
          choose(tickChoice.index);
        }, seconds * 1000),
      );
    }
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [choices, choose, atomKey]);
  const resetStory = useCallback(async () => {
    // 進行中の古いバッチがあってもstale扱いにし、以後の待ちも打ち切る。
    waitManager.reset(atomKey);
    // #web:gotoの予約が(異常系で)残っていた場合に備えて念のためクリアする。
    navigationManager.reset(atomKey);
    // 演出中の全GSAP timelineも打ち切る(シーンを最初からやり直す以上、
    // 前のシーンのシェイク/フラッシュ等が動いたままなのはおかしいため)。
    timelineManager.reset(atomKey);
    backlogManager.reset(atomKey);
    choiceManager.reset(atomKey);
    backgroundManager.reset(atomKey);
    characterManager.reset(atomKey);
    speakerManager.reset(atomKey);
    // 修正メモ: shake/flash/typeSpeedMs/type_waitモードは、以前の実装でも
    // resetStory()では意図的に触っていなかった(該当するsetStateの呼び出しが
    // 元々存在しない)ため、ここでも同じ範囲(cam/positionOverrides/
    // activeMessage/messageWindowHidden/contextStore)だけをリセットし、
    // 挙動を変えないようにしている。
    getStore().set(camAtomFamily(atomKey), {
      target: "",
      scale: 1,
      originX: 50,
      originY: 50,
    });
    positionManager.reset(atomKey);
    messageManager.reset(atomKey);
    windowVisibilityManager.reset(atomKey);
    // クリップを最初からやり直す以上、setContextで書き込んだ(exposeされた)
    // 値の写しも古い情報になるためクリアする。
    contextManager.reset(atomKey);
    // 保存されている簡易セーブも古い情報になるため消す(次回ロード時に
    // 古い状態へ復元されてしまうのを防ぐ)。消せなくても致命的ではない
    // (次のadvance()完了時にどのみち新しい状態で上書きされる)ので、
    // 結果は待たずfire-and-forgetで行う。
    if (saveProvider) {
      saveProvider.clear(clip).catch(() => {});
    }
    const result = await stepProvider.reset(clip, atomKey);
    await advance(result);
  }, [advance, clip, stepProvider, atomKey, saveProvider]);
  const setContextVars = useCallback(
    async (vars, options) => {
      const toWrite = contextManager.prepareWrite(atomKey, vars, options);
      for (const [varName, value] of Object.entries(toWrite)) {
        await stepProvider.idle(clip, varName, value, atomKey);
      }
    },
    [atomKey, clip, stepProvider],
  );
  const getContextVars = useCallback(
    async (varNames) => {
      return contextManager.getContextVars(atomKey, varNames);
    },
    [atomKey],
  );
  // #emit(他VN宛、3引数形)用の自己登録: このVNインスタンスが自分の
  // instanceId(=mount時のselector)でcore/instanceRegistry.tsに自己登録
  // しておくことで、他のVNインスタンスの#emit:<このinstanceId>:...タグから
  // 見つけてもらえるようになる。instanceIdが無い場合は登録しない
  // (他VNから名指しでemitできる対象は、公開スコープ識別子を持つインスタンス
  // だけ、という以前からの設計)。
  useEffect(() => {
    if (!instanceId) return;
    registerInstance(instanceId, { setContextVars });
    return () => unregisterInstance(instanceId);
  }, [instanceId, setContextVars]);
  // #emit(同一Ink=自分自身宛、2引数形)用の自己登録: instanceIdの有無に
  // 関わらず、必ず自分のatomKeyで登録しておく(#interruptを同じinkファイル
  // 内から起点にする用途等、instanceId未指定のインスタンスでも自己通知
  // だけは動く必要があるため)。
  useEffect(() => {
    registerSelf(atomKey, { setContextVars });
    return () => unregisterSelf(atomKey);
  }, [atomKey, setContextVars]);
  // タグシステム大改修フェーズ3: unmount時、このインスタンス専用に作られた
  // 全atomFamilyエントリ+GSAP timeline+#interrupt許可/pending/キューを
  // キャッシュ/レジストリから削除する(メモリリーク対策)。
  useEffect(() => {
    return () => {
      disposeBasicAtoms(atomKey);
      typeManager.dispose(atomKey);
      positionManager.dispose(atomKey);
      backgroundManager.dispose(atomKey);
      characterManager.dispose(atomKey);
      speakerManager.dispose(atomKey);
      messageManager.dispose(atomKey);
      choiceManager.dispose(atomKey);
      backlogManager.dispose(atomKey);
      windowVisibilityManager.dispose(atomKey);
      navigationManager.dispose(atomKey);
      waitManager.dispose(atomKey);
      contextManager.dispose(atomKey);
      timelineManager.dispose(atomKey);
      interruptManager.dispose(atomKey);
    };
  }, [atomKey]);
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
    atomKey,
  };
}
//# sourceMappingURL=useStoryEngine.js.map
