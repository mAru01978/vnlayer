'use client';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import VNLayerOverlay from './components/VNLayerOverlay';
import { setCharacterSlots } from './tags/characterSlots';
import { setTagConfig } from './tags/index';
import { serverStepProvider, createServerStepProvider } from './core/serverStepProvider';
import { createStaticStepProvider } from './core/staticStepProvider';
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
// (=EngineBridgeのonReadyが発火した時点)。Ink本文の初回ロード(fetch/inkjs実行)
// 自体の完了までは待たない(それを待つと「表示はされているがまだ値を送れない」
// 期間が無くなる代わりに、mount自体が遅く見えてしまうため)。
// これにより、以下のように順序を保証しながら書ける:
//   await VNLayer.mount("#vn", {...});
//   await VNLayer.setContext({...}, "#vn"); // ← "instance not ready"警告が出ない
function mount(selector, options) {
    if (instances.has(selector)) {
        console.warn(`[VNLayer] "${selector}" is already mounted. Call unmount() first if you want to remount.`);
        return Promise.resolve();
    }
    const container = resolveElement(selector);
    const root = createRoot(container);
    const instance = { root, container, handle: null };
    instances.set(selector, instance);
    return new Promise((resolve) => {
        root.render(createElement(VNLayerOverlay, {
            scenario: options.scenario ?? 'Scenario1',
            mode: options.mode,
            uiAnchor: options.uiAnchor,
            showUi: options.showUi,
            stepProvider: options.stepProvider,
            onReady: (handle) => {
                instance.handle = handle;
                resolve();
            },
        }));
    });
}
function unmount(selector) {
    const instance = instances.get(selector);
    if (!instance)
        return Promise.resolve();
    instance.root.unmount();
    instances.delete(selector);
    return Promise.resolve();
}
// setContext({ seconds }) : 引数のselectorを省略した場合、マウント中の全インスタンスに
// 同じ値をブロードキャストする(通常は1ページ1インスタンスなのでこれで十分)。
// 複数インスタンスを個別に制御したい場合は setContext(vars, selector) を使う。
async function setContext(vars, selector) {
    const targets = selector ? [instances.get(selector)].filter(Boolean) : Array.from(instances.values());
    if (targets.length === 0) {
        console.warn('[VNLayer] setContext called but no instance is mounted yet.');
        return;
    }
    await Promise.all(targets.map((instance) => {
        if (!instance?.handle) {
            console.warn('[VNLayer] setContext called before the instance finished initializing; ignoring this call.');
            return Promise.resolve();
        }
        return instance.handle.setContextVars(vars);
    }));
}
// VNLayer.notify("blink", payload?, selector?)
// ホストページ側の実イベント(クリック、他のウィジェットの状態変化、任意のタイミング等)を
// Inkに「今まさに起きたこと」として伝えるためのショートカット。
// 中身はsetContextと同じ経路(StepProvider.idleの一方通行書き込み)を使うが、
// 単に event_blink = payload と書くだけだと、Ink側は「値が変わったかどうか」でしか
// 検知できず、同じpayloadを続けて送った場合に区別が付かない。そこで
// event_blink_seq という単調増加のカウンタも一緒に書き込み、Ink側では
// 「event_blink_seqが前回チェック時と違う値になっていたら、新しくnotifyされた」
// という形で判定できるようにしてある。
//
// setContextとの役割分担:
//   - setContext: 継続的なデータ(時刻、設定値、他ページの状態等)を反映する
//   - notify:     「今この瞬間に何かが起きた」という単発の出来事を伝える。
//                 event_${name}/_seqの書き込みと同時に、実行中の
//                 #wait:/type_wait待ちを即座に打ち切り、event_loop等の
//                 #interrupt付き選択肢に辿り着き次第それを自動選択する
//                 (=「データを送る」と「即座に反応させる」を分けずに
//                  notify1回で両方やる)。seq採番自体はengine側
//                 (core/useStoryEngine.ts)に一本化したので、ここは
//                 handle.notify()への委譲のみ。
//
// #tickとの違い: #tickはInk側が「このシーンで何秒待ったか」を自己完結で
// 管理する内蔵タイマーで、ホストページの実イベントは一切見ない。
// notifyは逆にホスト側の実イベントをInkに伝える経路であり、#tickを置き換えるものではない。
async function notify(eventName, payload = true, selector) {
    const targets = selector ? [instances.get(selector)].filter(Boolean) : Array.from(instances.values());
    if (targets.length === 0) {
        console.warn('[VNLayer] notify called but no instance is mounted yet.');
        return;
    }
    await Promise.all(targets.map((instance) => {
        if (!instance?.handle) {
            console.warn('[VNLayer] notify called before the instance finished initializing; ignoring this call.');
            return Promise.resolve();
        }
        return instance.handle.notify(eventName, payload);
    }));
}
// VNLayer.reset(selector?)
// 進行状況を最初からやり直す。以前はvisibleChoices.length===0(=Inkが->ENDに
// 到達した状態)の時にStageViewが自動で「はじめから」ボタンを描画していたが、
// それだと文言もボタンの見た目もVNLayer側に固定されてしまう。
// 今はJS側(ホストページの好きなボタン・好きなタイミング)から呼べるようにし、
// 何を表示するか・いつ出すかは完全にホスト側またはInk側(本物の選択肢として
// "+[はじめから] -> home" を書く等)に委ねる形にした。
async function reset(selector) {
    const targets = selector ? [instances.get(selector)].filter(Boolean) : Array.from(instances.values());
    if (targets.length === 0) {
        console.warn('[VNLayer] reset called but no instance is mounted yet.');
        return;
    }
    await Promise.all(targets.map((instance) => {
        if (!instance?.handle) {
            console.warn('[VNLayer] reset called before the instance finished initializing; ignoring this call.');
            return Promise.resolve();
        }
        return instance.handle.resetStory();
    }));
}
async function configure(options) {
    if (options.characterSlots)
        setCharacterSlots(options.characterSlots);
    if (options.tags) {
        for (const [key, partial] of Object.entries(options.tags)) {
            setTagConfig(key, partial);
        }
    }
}
export const VNLayer = {
    mount,
    unmount,
    setContext,
    notify,
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
    window.VNLayer = VNLayer;
}
//# sourceMappingURL=api.js.map