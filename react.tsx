"use client";
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
//   configure(opts, selector)          → グローバル部分は configureVNLayer(opts)、
//                                          instance固有のui部分は <VNLayer ui={...} />
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
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type DependencyList,
  type RefObject,
} from "react";
import VNLayerOverlayInternal, {
  type VNLayerMode,
} from "./components/VNLayerOverlay";
import type { UiAnchor } from "./components/StageView";
import {
  setUiConfig,
  setTagConfig,
  setWebLinks,
  type UiConfigPatch,
} from "./tags/index";
import { setAnimAssets, type AnimAssetConfig } from "./tags/animAssets";
import {
  setSpriteAssets,
  type SpriteCharacterConfig,
} from "./tags/spriteAssets";
import { setAssetsConfig, type AssetsGlobalConfig } from "./tags/assetsConfig";
import type { StepProvider } from "./core/StepProvider";
import type { SaveProvider } from "./core/SaveProvider";
import type { SetContextOptions, VNLayerHandle } from "./core/types";

export type VNLayerProps = {
  clip?: string;
  // 省略時は'overlay'。
  mode?: VNLayerMode;
  uiAnchor?: UiAnchor;
  showUi?: boolean;
  stepProvider?: StepProvider;
  saveProvider?: SaveProvider | null;
  onNavigate?: (path: string) => void;
  // instance固有のUI上書き(tags/uiConfig.ts参照)。vanilla版の
  // VNLayer.configure({ui:{...}}, selector)のinstance版に相当する。
  // 内部的にこのコンポーネント専用のスコープ識別子(useId()由来)へ適用する。
  ui?: UiConfigPatch;
  // 他VNインスタンスから# emit:<selector>:...で名指しされたい場合や、
  // ui propを安定したキーでスコープしたい場合に明示的に渡す。省略時は
  // React.useId()由来の内部識別子を使う(ui propのスコープ分離目的のみで、
  // コロンを含みうるためink側の#emit宛先指定には使えない点に注意)。
  instanceId?: string;
  onReady?: () => void;
};

export type VNLayerRef = {
  setContext: (
    vars: Record<string, unknown>,
    options?: SetContextOptions,
  ) => Promise<void>;
  getContext: (varNames?: string[]) => Promise<Record<string, unknown>>;
  reset: () => Promise<void>;
};

// <VNLayer ref={vnRef} clip="Alice" mode="overlay" ui={{...}} onReady={...} />
export const VNLayer = forwardRef<VNLayerRef, VNLayerProps>(function VNLayer(
  {
    clip,
    mode,
    uiAnchor,
    showUi,
    stepProvider,
    saveProvider,
    onNavigate,
    ui,
    instanceId,
    onReady,
  },
  ref,
) {
  const generatedId = useId();
  const effectiveInstanceId = instanceId ?? generatedId;

  const handleRef = useRef<VNLayerHandle | null>(null);
  const readyNotifiedRef = useRef(false);

  // instance固有のui上書き。vanilla版のVNLayer.configure({ui}, selector)と
  // 同じsetUiConfig()経由(tags/uiConfig.ts、後から書いた方が勝つ共有ストア)。
  useEffect(() => {
    if (ui) setUiConfig(ui, effectiveInstanceId);
  }, [ui, effectiveInstanceId]);

  useImperativeHandle(
    ref,
    (): VNLayerRef => ({
      setContext: (vars, options) => {
        if (!handleRef.current) {
          console.warn(
            "[VNLayer] setContext called before the instance finished initializing; ignoring this call.",
          );
          return Promise.resolve();
        }
        return handleRef.current.setContextVars(vars, options);
      },
      getContext: (varNames) => {
        if (!handleRef.current) {
          console.warn(
            "[VNLayer] getContext called before the instance finished initializing.",
          );
          return Promise.resolve({});
        }
        return handleRef.current.getContextVars(varNames);
      },
      reset: () => {
        if (!handleRef.current) return Promise.resolve();
        return handleRef.current.resetStory();
      },
    }),
    [],
  );

  const handleReady = useCallback(
    (handle: VNLayerHandle) => {
      handleRef.current = handle;
      if (!readyNotifiedRef.current) {
        readyNotifiedRef.current = true;
        onReady?.();
      }
    },
    [onReady],
  );

  return (
    <VNLayerOverlayInternal
      clip={clip}
      mode={mode}
      uiAnchor={uiAnchor}
      showUi={showUi}
      stepProvider={stepProvider}
      saveProvider={saveProvider}
      onNavigate={onNavigate}
      instanceId={effectiveInstanceId}
      onReady={handleReady}
    />
  );
});

// VNLayer.configure(opts, selector?)のグローバル部分に相当
// (instance固有のui部分は<VNLayer ui={...} />props、上記参照)。
// 素材統合(2026-08-09): api.ts側のConfigureOptionsと同じ形のassets名前空間
// に統一している(vanilla版・React版で設定の書き方が食い違わないように)。
type ConfigureAssetsOptions = AssetsGlobalConfig & {
  sprite?: Record<string, SpriteCharacterConfig>;
  anim?: Record<string, Record<string, AnimAssetConfig>>;
};

export type ConfigureVNLayerOptions = {
  assets?: ConfigureAssetsOptions;
  tags?: Record<string, Record<string, unknown>>;
  ui?: UiConfigPatch;
  webLinks?: Record<string, string>;
};

export function configureVNLayer(options: ConfigureVNLayerOptions): void {
  if (options.assets) {
    const { sprite, anim, ...globalAssetsConfig } = options.assets;
    if (Object.keys(globalAssetsConfig).length > 0)
      setAssetsConfig(globalAssetsConfig);
    if (sprite) setSpriteAssets(sprite);
    if (anim) setAnimAssets(anim);
  }
  if (options.tags) {
    for (const [key, partial] of Object.entries(options.tags)) {
      setTagConfig(key, partial);
    }
  }
  if (options.ui) setUiConfig(options.ui);
  if (options.webLinks) setWebLinks(options.webLinks);
}

// refを持ちたくない場合向けの薄いhook(アイデア段階の案、シンプルな実装に
// 留めている)。depsが変わるたびに自動でsetContext(vars, options)する。
//   const vnRef = useRef<VNLayerRef>(null);
//   useVNLayerContext(vnRef, { hp, mp }, [hp, mp]);
export function useVNLayerContext(
  vnRef: RefObject<VNLayerRef | null>,
  vars: Record<string, unknown>,
  deps: DependencyList,
  options?: SetContextOptions,
): void {
  useEffect(() => {
    vnRef.current?.setContext(vars, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// StepProvider/SaveProviderのfactory類もvnlayer/react側から使えるよう
// re-exportしておく(vanilla版api.tsのVNLayerオブジェクトのプロパティと
// 同じ実体)。
export { createStaticStepProvider } from "./core/staticStepProvider";
export {
  serverStepProvider,
  createServerStepProvider,
} from "./core/serverStepProvider";
export { createLocalStorageSaveProvider } from "./core/saveProviders/localStorageSaveProvider";
export { createCookieSaveProvider } from "./core/saveProviders/cookieSaveProvider";
export { createServerSaveProvider } from "./core/saveProviders/serverSaveProvider";
export type { StepProvider } from "./core/StepProvider";
export type { SaveProvider, SaveData } from "./core/SaveProvider";
export type { VNLayerHandle, SetContextOptions } from "./core/types";
