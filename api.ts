'use client';
import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import VNLayerOverlay, { type VNLayerMode, type VNLayerHandle } from './components/VNLayerOverlay';
import type { UiAnchor } from './components/StageView';
import { setCharacterSlots, type CharacterSlot } from './tags/characterSlots';
import { setBackgroundSlots, type BackgroundSlot } from './tags/backgroundSlots';
import { setTagConfig, setUiConfig, type UiConfigPatch, setWebLinks } from './tags/index';
import { setAnimAssets, type AnimAssetConfig } from './tags/animAssets';
import { setSpriteAssets, type SpriteAssetConfig } from './tags/spriteAssets';
import type { SetContextOptions } from './core/types';
import type { StepProvider } from './core/StepProvider';
import { serverStepProvider, createServerStepProvider } from './core/serverStepProvider';
import { createStaticStepProvider } from './core/staticStepProvider';

// フェーズ1のゴール: 「VNLayer.mount("#vn", {scenario, mode})」のような
// 命令的APIを、既存のReactコンポーネント(VNLayerOverlay)の上に薄く被せて提供する。
// 中身は今までと同じReactツリーなので、Next.js運用時の挙動は一切変わらない。
//
// フェーズ2(vnlayer.js化)では、このファイル+core/+tags/+components/一式を
// inkjs・React・ReactDOM・gsapごとesbuild/rollupで1ファイルにバンドルし、
// window.VNLayer = api としてグローバル公開する想定。

type MountOptions = {
  scenario?: string;
  mode: VNLayerMode;
  // mode:"overlay"を複数同時にmountする場合(例: 左キャラ用/右キャラ用)、
  // バックログボタン・選択肢・ユーザー発言欄が同じ角に重ならないよう、
  // 片方を'left'、もう片方を'right'(既定)にする。
  uiAnchor?: UiAnchor;
  // false にすると操作UI一式(バックログ/選択肢/発言欄)を出さない。
  // 背景・キャラ・吹き出しの演出だけを行う「装飾専用インスタンス」向け。
  showUi?: boolean;
  // 省略時はその時点の既定StepProvider(Next.js版api.tsならserverStepProvider、
  // vnlayer.js単体バンドルならstaticStepProvider)を使う。
  // このmountインスタンスだけ「fetch経由」か「ブラウザ内で直接inkjs実行」かを
  // 個別に指定したい場合はここに渡す。
  //   例: VNLayer.mount("#vn", { scenario, mode, stepProvider: createStaticStepProvider() })
  stepProvider?: StepProvider;
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
// (=EngineBridgeのonReadyが発火した時点)。Ink本文の初回ロード(fetch/inkjs実行)
// 自体の完了までは待たない(それを待つと「表示はされているがまだ値を送れない」
// 期間が無くなる代わりに、mount自体が遅く見えてしまうため)。
// これにより、以下のように順序を保証しながら書ける:
//   await VNLayer.mount("#vn", {...});
//   await VNLayer.setContext({...}, "#vn"); // ← "instance not ready"警告が出ない
function mount(selector: string, options: MountOptions): Promise<void> {
  if (instances.has(selector)) {
    console.warn(`[VNLayer] "${selector}" is already mounted. Call unmount() first if you want to remount.`);
    return Promise.resolve();
  }

  const container = resolveElement(selector);
  const root = createRoot(container);
  const instance: Instance = { root, container, handle: null };
  instances.set(selector, instance);

  return new Promise<void>((resolve) => {
    root.render(
      createElement(VNLayerOverlay, {
        scenario: options.scenario ?? 'Scenario1',
        mode: options.mode,
        uiAnchor: options.uiAnchor,
        showUi: options.showUi,
        stepProvider: options.stepProvider,
        instanceId: selector,
        onReady: (handle: VNLayerHandle) => {
          instance.handle = handle;
          resolve();
        },
      })
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
  options?: SetContextOptions
): Promise<void> {
  const targets = selector ? [instances.get(selector)].filter(Boolean) : Array.from(instances.values());

  if (targets.length === 0) {
    console.warn('[VNLayer] setContext called but no instance is mounted yet.');
    return;
  }

  await Promise.all(
    targets.map((instance) => {
      if (!instance?.handle) {
        console.warn('[VNLayer] setContext called before the instance finished initializing; ignoring this call.');
        return Promise.resolve();
      }
      return instance.handle.setContextVars(vars, options);
    })
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
async function getContext(varNames?: string | string[], selector?: string): Promise<Record<string, unknown>> {
  let instance: Instance | undefined;
  if (selector) {
    instance = instances.get(selector);
  } else if (instances.size === 1) {
    instance = instances.values().next().value;
  } else {
    console.warn(
      `[VNLayer] getContext: ${instances.size} instance(s) are mounted; please specify a selector to disambiguate.`
    );
    return {};
  }

  if (!instance?.handle) {
    console.warn('[VNLayer] getContext called before the instance finished initializing, or no matching instance is mounted.');
    return {};
  }

  const names = varNames === undefined ? undefined : Array.isArray(varNames) ? varNames : [varNames];
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
// 未登録のキャラ/モーションはcomponents/mockRenderer.tsxが今まで通りの
// モック表示(色付き四角+ラベル)にフォールバックする。
type ConfigureOptions = {
  characterSlots?: Record<string, CharacterSlot>;
  backgroundSlots?: Record<string, BackgroundSlot>;
  tags?: Record<string, Record<string, unknown>>;
  ui?: UiConfigPatch;
  webLinks?: Record<string, string>;
  animAssets?: Record<string, Record<string, AnimAssetConfig>>;
  spriteAssets?: Record<string, Record<string, SpriteAssetConfig>>;
};

// VNLayer.reset(selector?)
// 進行状況を最初からやり直す。以前はvisibleChoices.length===0(=Inkが->ENDに
// 到達した状態)の時にStageViewが自動で「はじめから」ボタンを描画していたが、
// それだとJavaScriptの文言もボタンの見た目もVNLayer側に固定されてしまう。
// 今はJS側(ホストページの好きなボタン・好きなタイミング)から呼べるようにし、
// 何を表示するか・いつ出すかは完全にホスト側またはInk側(本物の選択肢として
// "+[はじめから] -> home" を書く等)に委ねる形にした。
async function reset(selector?: string): Promise<void> {
  const targets = selector ? [instances.get(selector)].filter(Boolean) : Array.from(instances.values());

  if (targets.length === 0) {
    console.warn('[VNLayer] reset called but no instance is mounted yet.');
    return;
  }

  await Promise.all(
    targets.map((instance) => {
      if (!instance?.handle) {
        console.warn('[VNLayer] reset called before the instance finished initializing; ignoring this call.');
        return Promise.resolve();
      }
      return instance.handle.resetStory();
    })
  );
}

// VNLayer.configure(options, selector?)
// characterSlots/tags/webLinks/animAssetsは常に全VN共通(グローバル)。
// uiだけは notify/setContext と同じ考え方でselectorを渡せる:
//   VNLayer.configure({ ui: {...} })         → 全VN共通のUI設定として適用
//   VNLayer.configure({ ui: {...} }, "#vn")  → "#vn"のVNだけに適用
async function configure(options: ConfigureOptions, selector?: string): Promise<void> {
  if (options.characterSlots) setCharacterSlots(options.characterSlots);
  if (options.backgroundSlots) setBackgroundSlots(options.backgroundSlots);
  if (options.tags) {
    for (const [key, partial] of Object.entries(options.tags)) {
      setTagConfig(key, partial);
    }
  }
  if (options.ui) setUiConfig(options.ui, selector);
  if (options.webLinks) setWebLinks(options.webLinks);
  if (options.animAssets) setAnimAssets(options.animAssets);
  if (options.spriteAssets) setSpriteAssets(options.spriteAssets);
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
};

// ブラウザで素朴に <script> 読み込みする運用(将来のvnlayer.js)に備えて
// window.VNLayer にも公開しておく。Next.jsのSSR中(windowが無い環境)では何もしない。
if (typeof window !== 'undefined') {
  (window as any).VNLayer = VNLayer;
}
