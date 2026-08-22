"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// vnlayer/react … VNLayerをReactらしいJSXコンポーネント+ref越しの命令的APIとして
// 使うための別エントリポイント(package.jsonのexports."./react"参照)。
//
// vanilla版(vnlayer本体のVNLayer.mount/unmount/setContext/getContext/reset/
// configure、api.ts参照)との対応:
//   mount(selector, opts)              → <VNLayer {...opts} ref={vnRef} /> をJSXに書く
//   unmount(selector)                  → そのJSXをアンマウントする(useEffect等は不要、
//                                          Reactのアンマウント処理に任せるだけでよい)
//   setContext(vars, selector, opts)   → vnRef.current.setContext(vars, opts)
//   getContext(names, selector)        → vnRef.current.getContext(names)
//   reset(selector)                    → vnRef.current.reset()
//   configure(opts, selector)          → configureVNLayer(opts, selector)
//                                          (2.1: configureスコープ統一により、
//                                          こちらもselectorを渡せる。
//                                          instance固有のui部分は<VNLayer
//                                          ui={...} />でも上書きできる、
//                                          どちらでも同じ実体に書き込む)
//
// 設計上の要石: ref経由で公開するメソッド(setContext/getContext/reset)の実体は
// core/types.tsのVNLayerHandle型(setContextVars/getContextVars/resetStory)を
// そのまま薄くラップしただけ。この型はvanilla版のapi.ts(mount()実装)とも
// 完全に共有しており、ここ以外の場所で「独自の」ハンドル形状を定義することは
// しない(vanilla版とReact版で挙動が食い違う最大のバグ源になるため)。
//
// 既定値メモ(簡易セーブ機能): stepProvider/saveProviderを省略した場合、
// vanilla版と全く同じ既定値(createStaticStepProvider({dataBaseUrl:"./data"}) +
// createLocalStorageSaveProvider())が使われる(core/defaultStepProvider.ts /
// core/defaultSaveProvider.ts参照。入口がJS/TSC/Reactのどれでも既定挙動は
// 統一されている)。
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, } from "react";
import VNLayerOverlayInternal from "./components/VNLayerOverlay";
import { setUiConfig, setTagConfig, setWebLinks, } from "./tags/index";
import { setAnimAssets } from "./tags/animAssets";
import { setSpriteAssets, } from "./tags/spriteAssets";
import { setAssetsConfig } from "./tags/assetsConfig";
import { setReservedVariablesConfig, } from "./core/reservedVariablesConfig";
// <VNLayer ref={vnRef} clip="Alice" mode="overlay" ui={{...}} onReady={...} />
export const VNLayer = forwardRef(function VNLayer({ clip, mode, uiAnchor, showUi, stepProvider, saveProvider, onNavigate, ui, instanceId, onReady, }, ref) {
    const generatedId = useId();
    const effectiveInstanceId = instanceId ?? generatedId;
    const handleRef = useRef(null);
    const readyNotifiedRef = useRef(false);
    // instance固有のui上書き。vanilla版のVNLayer.configure({ui}, selector)と
    // 同じsetUiConfig()経由(tags/uiConfig.ts、後から書いた方が勝つ共有ストア)。
    useEffect(() => {
        if (ui)
            setUiConfig(ui, effectiveInstanceId);
    }, [ui, effectiveInstanceId]);
    useImperativeHandle(ref, () => ({
        setContext: (vars, options) => {
            if (!handleRef.current) {
                console.warn("[VNLayer] setContext called before the instance finished initializing; ignoring this call.");
                return Promise.resolve();
            }
            return handleRef.current.setContextVars(vars, options);
        },
        getContext: (varNames) => {
            if (!handleRef.current) {
                console.warn("[VNLayer] getContext called before the instance finished initializing.");
                return Promise.resolve({});
            }
            return handleRef.current.getContextVars(varNames);
        },
        reset: () => {
            if (!handleRef.current)
                return Promise.resolve();
            return handleRef.current.resetStory();
        },
    }), []);
    const handleReady = useCallback((handle) => {
        handleRef.current = handle;
        if (!readyNotifiedRef.current) {
            readyNotifiedRef.current = true;
            onReady?.();
        }
    }, [onReady]);
    return (_jsx(VNLayerOverlayInternal, { clip: clip, mode: mode, uiAnchor: uiAnchor, showUi: showUi, stepProvider: stepProvider, saveProvider: saveProvider, onNavigate: onNavigate, instanceId: effectiveInstanceId, onReady: handleReady }));
});
// scope統一(2.1: configureスコープ統一、2026-08-19): 第2引数selectorを
// 追加。省略時は今まで通り全VN共通(グローバル)。指定すると、そのVN
// インスタンス(<VNLayer instanceId="..." />で渡したもの、または内部の
// useId()由来の識別子)だけに適用される。api.ts側のconfigure(options,
// selector)と同じ挙動に揃えている。
export function configureVNLayer(options, selector) {
    if (options.assets) {
        const { sprite, anim, ...globalAssetsConfig } = options.assets;
        if (Object.keys(globalAssetsConfig).length > 0)
            setAssetsConfig(globalAssetsConfig, selector);
        if (sprite)
            setSpriteAssets(sprite, selector);
        if (anim)
            setAnimAssets(anim, selector);
    }
    if (options.tags) {
        for (const [key, partial] of Object.entries(options.tags)) {
            setTagConfig(key, partial, selector);
        }
    }
    if (options.ui)
        setUiConfig(options.ui, selector);
    if (options.webLinks)
        setWebLinks(options.webLinks, selector);
    if (options.reservedVariables)
        setReservedVariablesConfig(options.reservedVariables);
}
// refを持ちたくない場合向けの薄いhook(アイデア段階の案、シンプルな実装に
// 留めている)。depsが変わるたびに自動でsetContext(vars, options)する。
//   const vnRef = useRef<VNLayerRef>(null);
//   useVNLayerContext(vnRef, { hp, mp }, [hp, mp]);
export function useVNLayerContext(vnRef, vars, deps, options) {
    useEffect(() => {
        vnRef.current?.setContext(vars, options);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
export function getDataElements(name, root) {
    const scope = root ?? document;
    const nodeList = scope.querySelectorAll("[data-vn-key]");
    const results = [];
    nodeList.forEach((el) => {
        const key = el.getAttribute("data-vn-key") ?? "";
        if (name && key !== name && !key.startsWith(`${name}:`))
            return;
        results.push({ key, type: el.constructor.name, element: el });
    });
    return results;
}
// StepProvider/SaveProviderのfactory類もvnlayer/react側から使えるよう
// re-exportしておく(vanilla版api.tsのVNLayerオブジェクトのプロパティと
// 同じ実体)。
export { createStaticStepProvider } from "./core/staticStepProvider";
export { serverStepProvider, createServerStepProvider, } from "./core/serverStepProvider";
export { createLocalStorageSaveProvider } from "./core/saveProviders/localStorageSaveProvider";
export { createCookieSaveProvider } from "./core/saveProviders/cookieSaveProvider";
export { createServerSaveProvider } from "./core/saveProviders/serverSaveProvider";
//# sourceMappingURL=react.js.map