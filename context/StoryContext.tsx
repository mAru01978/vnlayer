'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { useStoryEngine } from '../core/useStoryEngine';
import type { StepProvider } from '../core/StepProvider';
import { getDefaultOnNavigate } from '../core/defaultNavigate';

// 修正メモ(切り出し対応): 以前はここで data/characterSlots.json を直接importして
// いたが、それだとVNLayerフォルダの外(ホストアプリ側のdata/フォルダ)を
// 直接参照してしまい、VNLayerを別リポジトリに切り出した瞬間にimportが壊れる。
//
// VNLayerフォルダ配下のファイルは、自分の外にあるプロジェクト固有の資産
// (data/characterSlots.json等)を一切importしない、という原則に統一した。
// 立ち位置データの注入は、ホストアプリ側(Next.jsアプリのapp/layout.tsx等、
// VNLayerフォルダの外)から
//   import { VNLayer } from '@/VNLayer/api';
//   import characterSlots from '@/data/characterSlots.json';
//   VNLayer.configure({ characterSlots });
// のように1回呼んでもらう形にする(既存のVNLayer.configure()がそのまま使える)。
//
// 同様に、next/navigationへの依存はcontext/NextNavigationBridge.tsxだけに
// 切り出し済み(このファイル自体はNext.jsを一切importしない)。
// onNavigateを明示的に渡さなかった場合はcore/defaultNavigate.tsの既定値
// (未設定ならlocation.href代入、Next.js運用でNextNavigationBridgeをマウント
// していればrouter.push)が使われる。

const StoryContext = createContext<ReturnType<typeof useStoryEngine> | null>(null);

export const StoryProvider = ({
  children,
  scenario = 'Scenario1',
  stepProvider,
  onNavigate,
  instanceId,
}: {
  children: ReactNode;
  scenario?: string;
  // 明示的に渡した場合のみそちらを使う(未指定ならcore側の既定Providerを使う)
  stepProvider?: StepProvider;
  onNavigate?: (path: string) => void;
  // このVNインスタンス自身の識別子(通常はmount()時のselector)。
  // #ui:...タグの設定をこのインスタンスだけにスコープするために使う。
  instanceId?: string;
}) => {
  const engine = useStoryEngine(scenario, {
    stepProvider,
    onNavigate: onNavigate ?? getDefaultOnNavigate(),
    instanceId,
  });

  return <StoryContext.Provider value={engine}>{children}</StoryContext.Provider>;
};

export const useStory = () => useContext(StoryContext);
