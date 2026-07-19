'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { StoryProvider, useStory } from '../context/StoryContext';
import StageView from './StageView';
// StoryProviderの内側でuseStory()を呼び、engineの最新関数をref経由でapi.ts側に
// 橋渡しするだけの非表示コンポーネント。engineオブジェクト自体は毎レンダー
// 新しく作られるが、handle経由で呼べば常に最新のsetContextVars/resetStoryを
// 呼び出せるようにしてある(onReadyは初回マウント時に1回だけ呼ぶ)。
function EngineBridge({ onReady }) {
    const engine = useStory();
    const engineRef = useRef(engine);
    engineRef.current = engine;
    const notifiedRef = useRef(false);
    useEffect(() => {
        if (notifiedRef.current || !onReady)
            return;
        notifiedRef.current = true;
        onReady({
            setContextVars: (vars) => engineRef.current.setContextVars(vars),
            resetStory: () => engineRef.current.resetStory(),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
}
// StoryProviderをこのコンポーネント自身が内包しているので、
// <VNLayerOverlay scenario="BlogIntro" mode="overlay" /> をどのページに置いても
// それだけでそのシナリオ用のエンジン一式が独立して動く。
// (旧VNLayer.tsxと同じ役割。描画自体はStageViewに一本化されている)
export default function VNLayerOverlay({ scenario = 'Scenario1', mode, uiAnchor, showUi, stepProvider, onNavigate, onReady }) {
    return (_jsxs(StoryProvider, { scenario: scenario, stepProvider: stepProvider, onNavigate: onNavigate, children: [_jsx(EngineBridge, { onReady: onReady }), _jsx(StageView, { mode: mode, uiAnchor: uiAnchor, showUi: showUi })] }));
}
//# sourceMappingURL=VNLayerOverlay.js.map