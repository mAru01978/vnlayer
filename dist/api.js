"use client";
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import VNLayerOverlay from "./components/VNLayerOverlay";
import { setSpriteAssets } from "./tags/spriteAssets";
import { setTagConfig, setUiConfig, setWebLinks } from "./tags/index";
import { setAnimAssets } from "./tags/animAssets";
import { setAssetsConfig } from "./tags/assetsConfig";
import {
  serverStepProvider,
  createServerStepProvider,
} from "./core/serverStepProvider";
import { createStaticStepProvider } from "./core/staticStepProvider";
import { createLocalStorageSaveProvider } from "./core/saveProviders/localStorageSaveProvider";
import { createCookieSaveProvider } from "./core/saveProviders/cookieSaveProvider";
import { createServerSaveProvider } from "./core/saveProviders/serverSaveProvider";
const instances = new Map();
function resolveElement(selector) {
  const el = document.querySelector(selector);
  if (!el) {
    throw new Error(`[VNLayer] element not found for selector: ${selector}`);
  }
  return el;
}
// mount()はPromiseを返す。resolveされるのは「そのインスタンスのStoryProviderが
// マウントされ、setContext/notify/reset等を安全に呼べる状態になった」時点
// (=EngineBridgeのonReadyが発火した時点)。Ink本文の初回ロード(fetch/inkjs実行、
// および簡易セーブからの復元)自体の完了までは待たない(それを待つと
// 「表示はされているがまだ値を送れない」期間が無くなる代わりに、mount自体が
// 遅く見えてしまうため)。
// これにより、以下のように順序を保証しながら書ける:
//   await VNLayer.mount("#vn", {...});
//   await VNLayer.setContext({...}, "#vn"); // ← "instance not ready"警告が出ない
function mount(selector, options) {
  if (instances.has(selector)) {
    console.warn(
      `[VNLayer] "${selector}" is already mounted. Call unmount() first if you want to remount.`,
    );
    return Promise.resolve();
  }
  const container = resolveElement(selector);
  const root = createRoot(container);
  const instance = { root, container, handle: null };
  instances.set(selector, instance);
  return new Promise((resolve) => {
    root.render(
      createElement(VNLayerOverlay, {
        clip: options.clip ?? "Scenario1",
        mode: options.mode ?? "overlay",
        uiAnchor: options.uiAnchor,
        showUi: options.showUi,
        stepProvider: options.stepProvider,
        saveProvider: options.saveProvider,
        instanceId: selector,
        onReady: (handle) => {
          instance.handle = handle;
          resolve();
        },
      }),
    );
  });
}
function unmount(selector) {
  const instance = instances.get(selector);
  if (!instance) return Promise.resolve();
  instance.root.unmount();
  instances.delete(selector);
  return Promise.resolve();
}
// api-refactor-1/2(真の統合版): 第3引数optionsで挙動を制御する。
//   options.notify: true
//     → 渡した各キーに対して"${key}_seq"という単調増加カウンタを自動生成・
//       インクリメントし、値と一緒に書き込む(呼び出し側はseqを一切
//       意識しなくてよい)。同時に実行中の#wait:/type_wait待ちを即座に
//       打ち切り、event_loop等の#interrupt付き選択肢に辿り着き次第それを
//       自動選択する。
//   options.expose: false (既定はtrue)
//     → 書き込んだ値をVNLayer.getContext()から見えないようにする。
//       既定(true)の間はgetContext()で読み返せる。将来追加予定の#emit
//       特殊タグ等、内部的な書き込みを外部に露出させたくない場合に使う想定。
// これにより、以前は別APIだったVNLayer.notify(eventName, payload, selector)は
// 完全に不要になったため廃止した(seqの面倒もこちら側が見てくれるため)。
//
//   旧: VNLayer.notify("blink", true);
//   新: VNLayer.setContext({ vn_event_blink: true }, undefined, { notify: true });
//       → vn_event_blink / vn_event_blink_seq が自動で書き込まれる
//
// #tickとの違い: #tickはInk側が「このシーンで何秒待ったか」を自己完結で
// 管理する内蔵タイマーで、ホストページの実イベントは一切見ない。
// notify:trueは逆にホスト側の実イベントをInkに伝える経路であり、
// #tickを置き換えるものではない。
async function setContext(vars, selector, options) {
  const targets = selector
    ? [instances.get(selector)].filter(Boolean)
    : Array.from(instances.values());
  if (targets.length === 0) {
    console.warn("[VNLayer] setContext called but no instance is mounted yet.");
    return;
  }
  await Promise.all(
    targets.map((instance) => {
      if (!instance?.handle) {
        console.warn(
          "[VNLayer] setContext called before the instance finished initializing; ignoring this call.",
        );
        return Promise.resolve();
      }
      return instance.handle.setContextVars(vars, options);
    }),
  );
}
// VNLayer.getContext(varNames?, selector?)
// setContextの読み取り版。setContextで(expose:falseでなく)書き込まれた値の
// JS側の写しを返す。ink本体(variablesState)には問い合わせないため、
// サーバー往復(Next.js運用時)は発生しない。単一の変数名(string)・配列・
// 省略(exposeされている値すべて)のいずれでも渡せる。setContextと違い、
// 複数インスタンスへの一括ブロードキャストは意味を持たない(読み取り結果を
// どう合成するかが曖昧なため)ので、mount中のインスタンスが1つだけなら
// selector省略可、2つ以上ある場合はselector必須。
//   const { hp } = await VNLayer.getContext("hp", "#vn");
//   const vars = await VNLayer.getContext(["hp", "mp"], "#vn");
//   const all = await VNLayer.getContext(undefined, "#vn"); // exposeされてる値すべて
async function getContext(varNames, selector) {
  let instance;
  if (selector) {
    instance = instances.get(selector);
  } else if (instances.size === 1) {
    instance = instances.values().next().value;
  } else {
    console.warn(
      `[VNLayer] getContext: ${instances.size} instance(s) are mounted; please specify a selector to disambiguate.`,
    );
    return {};
  }
  if (!instance?.handle) {
    console.warn(
      "[VNLayer] getContext called before the instance finished initializing, or no matching instance is mounted.",
    );
    return {};
  }
  const names =
    varNames === undefined
      ? undefined
      : Array.isArray(varNames)
        ? varNames
        : [varNames];
  return instance.handle.getContextVars(names);
}
// VNLayer.reset(selector?)
// 進行状況を最初からやり直す。以前はvisibleChoices.length===0(=Inkが->ENDに
// 到達した状態)の時にStageViewが自動で「はじめから」ボタンを描画していたが、
// それだとJavaScriptの文言もボタンの見た目もVNLayer側に固定されてしまう。
// 今はJS側(ホストページの好きなボタン・好きなタイミング)から呼べるようにし、
// 何を表示するか・いつ出すかは完全にホスト側またはInk側(本物の選択肢として
// "+[はじめから] -> home" を書く等)に委ねる形にした。保存されている簡易
// セーブも(saveProviderが設定されていれば)一緒にクリアされる
// (core/useStoryEngine.tsのresetStory()参照)。
async function reset(selector) {
  const targets = selector
    ? [instances.get(selector)].filter(Boolean)
    : Array.from(instances.values());
  if (targets.length === 0) {
    console.warn("[VNLayer] reset called but no instance is mounted yet.");
    return;
  }
  await Promise.all(
    targets.map((instance) => {
      if (!instance?.handle) {
        console.warn(
          "[VNLayer] reset called before the instance finished initializing; ignoring this call.",
        );
        return Promise.resolve();
      }
      return instance.handle.resetStory();
    }),
  );
}
// VNLayer.configure(options, selector?)
// characterSlots/tags/webLinks/animAssetsは常に全VN共通(グローバル)。
// uiだけは notify/setContext と同じ考え方でselectorを渡せる:
//   VNLayer.configure({ ui: {...} })         → 全VN共通のUI設定として適用
//   VNLayer.configure({ ui: {...} }, "#vn")  → "#vn"のVNだけに適用
async function configure(options, selector) {
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
  if (options.ui) setUiConfig(options.ui, selector);
  if (options.webLinks) setWebLinks(options.webLinks);
}
export const VNLayer = {
  mount,
  unmount,
  setContext,
  getContext,
  reset,
  configure,
  // 修正: 以前はこの2つを「モジュールの名前付きexport」としてだけ公開していたが、
  // window.VNLayer = VNLayer で公開されるのはこのオブジェクトの中身だけなので、
  // <script>から VNLayer.createStaticStepProvider(...) と呼んでも見えず
  // "is not a function" になっていた。VNLayerオブジェクト自身のプロパティとして持たせる。
  serverStepProvider,
  createServerStepProvider,
  createStaticStepProvider,
  // 簡易セーブ機能用(core/SaveProvider.ts参照)。既定はcreateLocalStorageSaveProvider()。
  createLocalStorageSaveProvider,
  createCookieSaveProvider,
  createServerSaveProvider,
};
// ブラウザで素朴に <script> 読み込みする運用(将来のvnlayer.js)に備えて
// window.VNLayer にも公開しておく。Next.jsのSSR中(windowが無い環境)では何もしない。
if (typeof window !== "undefined") {
  window.VNLayer = VNLayer;
}
//# sourceMappingURL=api.js.map
