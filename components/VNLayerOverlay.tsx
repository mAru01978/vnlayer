'use client';
import { useEffect, useRef } from 'react';
import { StoryProvider, useStory } from '../context/StoryContext';
import type { StepProvider } from '../core/StepProvider';
import type { SaveProvider } from '../core/SaveProvider';
import type { SetContextOptions, VNLayerHandle } from '../core/types';
import StageView, { type StageMode, type UiAnchor } from './StageView';

export type VNLayerMode = StageMode;

// VNLayerHandleの実体はcore/types.tsで一元定義している(vanilla版・React版で
// 型がズレるのを防ぐための「設計上の要石」。api.ts側のコメントも参照)。
// このファイルからも従来通りimportできるよう再exportしておく。
export type { VNLayerHandle } from '../core/types';

export type VNLayerOverlayProps = {
  // 用語メモ(2026-08-08、Scenario→Clip改称): propは`clip`に統一。
  clip?: string;
  // mode省略時は'overlay'(既定のstepProvider/saveProviderと同じく、
  // 「まず追加設定無しで動く」ことを優先した既定値)。
  mode?: VNLayerMode;
  // overlayを複数同時に出す時、UI要素(バックログ/選択肢等)の固定側を分けるため
  uiAnchor?: UiAnchor;
  // false にすると操作UI一式(バックログ/選択肢/発言欄)を出さない。
  // 背景・キャラ・吹き出しはInk側のタグでの制御のみになる(演出専用インスタンス向け)。
  showUi?: boolean;
  // 省略時はcore/defaultStepProvider.tsの既定値(2026-08-08以降は
  // createStaticStepProvider({dataBaseUrl:"./data"})が既定)を使う。
  // mount単位で「このインスタンスだけサーバー実行にする」等の上書きもここで可能。
  stepProvider?: StepProvider;
  // 簡易セーブ機能。省略時はcore/defaultSaveProvider.tsの既定値
  // (createLocalStorageSaveProvider())を使う。nullを渡すとこのインスタンスは
  // セーブ/ロードを一切行わない。
  saveProvider?: SaveProvider | null;
  onNavigate?: (path: string) => void;
  // マウント直後にVNLayerHandleを1回だけ受け取るコールバック(api.ts/react.tsx専用、通常は使わない)
  onReady?: (handle: VNLayerHandle) => void;
  // このVNインスタンス自身の識別子(api.tsのmount()が自動でselector文字列を渡す)。
  // #ui:...タグの設定をこのインスタンスだけにスコープするために使う。
  instanceId?: string;
};

// StoryProviderの内側でuseStory()を呼び、engineの最新関数をref経由でapi.ts側に
// 橋渡しするだけの非表示コンポーネント。engineオブジェクト自体は毎レンダー
// 新しく作られるが、handle経由で呼べば常に最新のsetContextVars/resetStoryを
// 呼び出せるようにしてある(onReadyは初回マウント時に1回だけ呼ぶ)。
function EngineBridge({ onReady }: { onReady?: (handle: VNLayerHandle) => void }) {
  const engine = useStory();
  const engineRef = useRef(engine);
  engineRef.current = engine;

  const notifiedRef = useRef(false);
  useEffect(() => {
    if (notifiedRef.current || !onReady) return;
    notifiedRef.current = true;
    onReady({
      setContextVars: (vars, options) => engineRef.current!.setContextVars(vars, options),
      getContextVars: (varNames) => engineRef.current!.getContextVars(varNames),
      resetStory: () => engineRef.current!.resetStory(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// StoryProviderをこのコンポーネント自身が内包しているので、
// <VNLayerOverlay clip="BlogIntro" mode="overlay" /> をどのページに置いても
// それだけでそのクリップ用のエンジン一式が独立して動く。
// (旧VNLayer.tsxと同じ役割。描画自体はStageViewに一本化されている)
export default function VNLayerOverlay({
  clip = 'Scenario1',
  mode = 'overlay',
  uiAnchor,
  showUi,
  stepProvider,
  saveProvider,
  onNavigate,
  onReady,
  instanceId,
}: VNLayerOverlayProps) {
  return (
    <StoryProvider
      clip={clip}
      stepProvider={stepProvider}
      saveProvider={saveProvider}
      onNavigate={onNavigate}
      instanceId={instanceId}
    >
      <EngineBridge onReady={onReady} />
      <StageView mode={mode} uiAnchor={uiAnchor} showUi={showUi} />
    </StoryProvider>
  );
}
