'use client';
import { useEffect, useRef } from 'react';
import { StoryProvider, useStory } from '../context/StoryContext';
import type { StepProvider } from '../core/StepProvider';
import StageView, { type StageMode, type UiAnchor } from './StageView';

export type VNLayerMode = StageMode;

// api.ts(VNLayer.mount/setContext)から命令的に操作するための最小ハンドル。
export type VNLayerHandle = {
  setContextVars: (vars: Record<string, unknown>) => Promise<void>;
  resetStory: () => Promise<void>;
  // host→ink一方向イベント通知(即時反応込み)。api.tsのVNLayer.notify()が使う。
  notify: (eventName: string, payload?: unknown) => Promise<void>;
};

export type VNLayerOverlayProps = {
  scenario?: string;
  mode: VNLayerMode;
  // overlayを複数同時に出す時、UI要素(バックログ/選択肢等)の固定側を分けるため
  uiAnchor?: UiAnchor;
  // false にすると操作UI一式(バックログ/選択肢/発言欄)を出さない。
  // 背景・キャラ・吹き出しはInk側のタグでの制御のみになる(演出専用インスタンス向け)。
  showUi?: boolean;
  // 省略時はcore/defaultStepProvider.tsの既定値(通常はserverStepProvider、
  // vnlayer.js単体バンドルではstaticStepProvider)を使う。mount単位で
  // 「このインスタンスだけ静的実行にする」等の上書きもここで可能。
  stepProvider?: StepProvider;
  onNavigate?: (path: string) => void;
  // マウント直後にVNLayerHandleを1回だけ受け取るコールバック(api.ts専用、通常は使わない)
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
      setContextVars: (vars) => engineRef.current!.setContextVars(vars),
      resetStory: () => engineRef.current!.resetStory(),
      notify: (eventName, payload) => engineRef.current!.notify(eventName, payload),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// StoryProviderをこのコンポーネント自身が内包しているので、
// <VNLayerOverlay scenario="BlogIntro" mode="overlay" /> をどのページに置いても
// それだけでそのシナリオ用のエンジン一式が独立して動く。
// (旧VNLayer.tsxと同じ役割。描画自体はStageViewに一本化されている)
export default function VNLayerOverlay({ scenario = 'Scenario1', mode, uiAnchor, showUi, stepProvider, onNavigate, onReady, instanceId }: VNLayerOverlayProps) {
  return (
    <StoryProvider scenario={scenario} stepProvider={stepProvider} onNavigate={onNavigate} instanceId={instanceId}>
      <EngineBridge onReady={onReady} />
      <StageView mode={mode} uiAnchor={uiAnchor} showUi={showUi} />
    </StoryProvider>
  );
}
