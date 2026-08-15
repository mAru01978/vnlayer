"use client";
import { createRoot, type Root } from "react-dom/client";
import { createElement } from "react";
import VNLayerOverlay, {
  type VNLayerMode,
  type VNLayerHandle,
} from "./components/VNLayerOverlay";
import type { UiAnchor } from "./components/StageView";
import {
  setSpriteAssets,
  type SpriteCharacterConfig,
} from "./tags/spriteAssets";
import {
  setTagConfig,
  setUiConfig,
  type UiConfigPatch,
  setWebLinks,
} from "./tags/index";
import { setAnimAssets, type AnimAssetConfig } from "./tags/animAssets";
import { setAssetsConfig, type AssetsGlobalConfig } from "./tags/assetsConfig";
import type { SetContextOptions } from "./core/types";
import type { StepProvider } from "./core/StepProvider";
import type { SaveProvider } from "./core/SaveProvider";
import {
  serverStepProvider,
  createServerStepProvider,
} from "./core/serverStepProvider";
import { createStaticStepProvider } from "./core/staticStepProvider";
import { createLocalStorageSaveProvider } from "./core/saveProviders/localStorageSaveProvider";
import { createCookieSaveProvider } from "./core/saveProviders/cookieSaveProvider";
import { createServerSaveProvider } from "./core/saveProviders/serverSaveProvider";

// フェーズ1のゴール: 「VNLayer.mount("#vn", {clip, mode})」のような
// 命令的APIを、既存のReactコンポーネント(VNLayerOverlay)の上に薄く被せて提供する。
// 中身は今までと同じReactツリーなので、Next.js運用時の挙動は一切変わらない。
//
// フェーズ2(vnlayer.js化)では、このファイル+core/+tags/+components/一式を
// inkjs・React・ReactDOM・gsapごとesbuild/rollupで1ファイルにバンドルし、
// window.VNLayer = api としてグローバル公開する想定。
//
// 用語メモ(2026-08-08、Scenario→Clip改称): 以前「Scenario」と呼んでいた
// 単位(1本のInk本文+それに紐づくstory.json)は、スクリプトというほど固定的
// でもなく、かといってイベント駆動な使い方もできる(#interrupt等)、という
// 性質がFlashの「クリップ」に近いという判断からClipへ改称した。
// VNLayer.mount()の指定キーは `clip` になる(vnlayer.js側・React側どちらの
// APIも統一。以前の `scenario` キーは完全に置き換え、両立はさせない)。
//
// 既定値メモ(2026-08-08、簡易セーブ機能追加): mount()は追加設定なしでも
// 「静的実行(createStaticStepProvider) + ローカルストレージ簡易セーブ
// (createLocalStorageSaveProvider)」で動く。つまり
//   await VNLayer.mount("#vn", { clip: "Alice" });
// これだけで、サーバー無しでも進行状況の簡易セーブ/自動ロードまで含めて動く。
// サーバー実行にしたい/セーブ先をCookieや自前サーバーに変えたい場合は
// stepProvider/saveProviderを明示的に渡す(下記MountOptions参照)。

type MountOptions = {
  clip?: string;
  // 省略時は'overlay'。
  mode?: VNLayerMode;
  // mode:"overlay"を複数同時にmountする場合(例: 左キャラ用/右キャラ用)、
  // バックログボタン・選択肢・ユーザー発言欄が同じ角に重ならないよう、
  // 片方を'left'、もう片方を'right'(既定)にする。
  uiAnchor?: UiAnchor;
  // false にすると操作UI一式(バックログ/選択肢/発言欄)を出さない。
  // 背景・キャラ・吹き出しの演出だけを行う「装飾専用インスタンス」向け。
  showUi?: boolean;
  // 省略時は既定のstaticStepProvider(dataBaseUrl:"./data")を使う。
  // このmountインスタンスだけ「fetch経由」か「サーバーAPI経由」かを個別に
  // 指定したい場合はここに渡す。
  //   例: VNLayer.mount("#vn", { clip, stepProvider: VNLayer.serverStepProvider })
  stepProvider?: StepProvider;
  // 省略時は既定のcreateLocalStorageSaveProvider()を使う。
  //   例: VNLayer.mount("#vn", { clip, saveProvider: VNLayer.createCookieSaveProvider() })
  // nullを渡すとこのインスタンスはセーブ/ロードを一切行わない。
  saveProvider?: SaveProvider | null;
};

type Instance = {
  root: Root;
  container: Element;
  handle: VNLayerHandle | null;
};

const instances = new Map<string, Instance>();

function resolveElement(selector: string): Element {
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
function mount(selector: string, options: MountOptions): Promise<void> {
  if (instances.has(selector)) {
    console.warn(
      `[VNLayer] "${selector}" is already mounted. Call unmount() first if you want to remount.`,
    );
    return Promise.resolve();
  }

  const container = resolveElement(selector);
  const root = createRoot(container);
  const instance: Instance = { root, container, handle: null };
  instances.set(selector, instance);

  return new Promise<void>((resolve) => {
    root.render(
      createElement(VNLayerOverlay, {
        clip: options.clip ?? "Scenario1",
        mode: options.mode ?? "overlay",
        uiAnchor: options.uiAnchor,
        showUi: options.showUi,
        stepProvider: options.stepProvider,
        saveProvider: options.saveProvider,
        instanceId: selector,
        onReady: (handle: VNLayerHandle) => {
          instance.handle = handle;
          resolve();
        },
      }),
    );
  });
}

function unmount(selector: string): Promise<void> {
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
async function setContext(
  vars: Record<string, unknown>,
  selector?: string,
  options?: SetContextOptions,
): Promise<void> {
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
async function getContext(
  varNames?: string | string[],
  selector?: string,
): Promise<Record<string, unknown>> {
  let instance: Instance | undefined;
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

// VNLayer.configure({ characterSlots: {...}, tags: { cam: {...}, wait: {...} },
//                      ui: { choice: { spacing: 16 } }, webLinks: { blogHome: "https://..." },
//                      animAssets: { alice: { walk: { mode: 'single', src: '/assets/anim/alice_walk.webm' } } } })
// Next.js運用ではcontext/StoryContext.tsxが自動でcharacterSlotsを注入するので
// 通常は呼ばなくてよいが、静的運用(vnlayer.js)や、タグの挙動を実行時に
// 上書きしたい場合(例: 演出のテンポ調整)に使う。
// ui/tagsはink側の#ui:.../タグ設定と同じ実体を共有するので、どちらから
// 上書きしても「後勝ち」で反映される(優先度判定は無い)。
// webLinksは#web:open/#web:gotoが「完全に別サイトへ行く」時に参照する
// 許可済みリンクのホワイトリスト(inkのソース上に生URLを書けない制約の回避も兼ねる)。
// animAssetsは#anim:<キャラ>:motion:<モーション名>が実際に何を表示するか
// (連番画像かwebm動画か)を解決するための素材レジストリ(tags/animAssets.ts参照)。
// 未登録のキャラ/モーションはcomponents/Renderer.tsxが(fallbackToMock設定に従い)
// モック表示(色付き四角+ラベル)にフォールバックするか、AssetErrorを報告して
// モック表示(色付き四角+ラベル)にフォールバックする。
// 素材統合(2026-08-09): characterSlots/backgroundSlots/animAssets/
// spriteAssetsという個別のoptionsは廃止し、assetsという1つの名前空間へ
// まとめた(VNLayer.configure({ assets: {...}, tags: {...}, ui: {...},
// webLinks: {...} })のように使う)。
//   assets.basePath/source/resolveLocal/fallbackToMock … 素材共通設定
//     (tags/assetsConfig.ts参照。source:'local'はNext.js等、fetchが
//     publicフォルダのものしか取れない環境向けの回避策)。
//   assets.sprite … 静止画系全般(キャラの表情立ち絵も背景も含む)。
//     旧characterSlots(立ち位置)+backgroundSlots(色/画像)+旧spriteAssets
//     (表情画像)を統合したもの(tags/spriteAssets.ts参照)。
//   assets.anim … モーション(連番画像/単一動画)。旧animAssetsのまま
//     (tags/animAssets.ts参照)、ただし素材ごとのsource上書きにも対応。
type ConfigureAssetsOptions = AssetsGlobalConfig & {
  sprite?: Record<string, SpriteCharacterConfig>;
  anim?: Record<string, Record<string, AnimAssetConfig>>;
};

type ConfigureOptions = {
  assets?: ConfigureAssetsOptions;
  tags?: Record<string, Record<string, unknown>>;
  ui?: UiConfigPatch;
  webLinks?: Record<string, string>;
};

// VNLayer.reset(selector?)
// 進行状況を最初からやり直す。以前はvisibleChoices.length===0(=Inkが->ENDに
// 到達した状態)の時にStageViewが自動で「はじめから」ボタンを描画していたが、
// それだとJavaScriptの文言もボタンの見た目もVNLayer側に固定されてしまう。
// 今はJS側(ホストページの好きなボタン・好きなタイミング)から呼べるようにし、
// 何を表示するか・いつ出すかは完全にホスト側またはInk側(本物の選択肢として
// "+[はじめから] -> home" を書く等)に委ねる形にした。保存されている簡易
// セーブも(saveProviderが設定されていれば)一緒にクリアされる
// (core/useStoryEngine.tsのresetStory()参照)。
async function reset(selector?: string): Promise<void> {
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
async function configure(
  options: ConfigureOptions,
  selector?: string,
): Promise<void> {
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
  (window as any).VNLayer = VNLayer;
}
