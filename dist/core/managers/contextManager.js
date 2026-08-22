// VNLayer.setContext()/getContext() (core/useStoryEngine.tsのsetContextVars/
// getContextVars)が書き込む値のローカルの写しと、notify:true時のwake(interrupt)処理。
//
// 2.15(sync/notify見直し、2026-08-19): 以前はnotify:trueの時だけ
// #wait/type_wait待ちの打ち切り+#interrupt起動を行い、それとは独立に
// expose(既定true)でJS側の読み取りキャッシュへの反映有無を切り替えて
// いた。しかしexposeは「非公開のつもりで書いても実質どこからでも
// getContext()で読めてしまう」抜け穴でしかなく、syncとの相性も悪かった
// ため廃止した。setContextされた値は常にJS側のキャッシュ(getContextVars()
// で読める値)へ反映される。
//
// 代わりに導入したのがsyncフラグ(既定true)。以前は「vnlayer→ink」の
// 一方通行の書き込みだけだったが、sync:trueの変数はStory側の
// ObserveVariableを使って逆方向(ink本文が素の代入 ~ hp = hp - 10 等で
// その変数を変えた時、vnlayer管理のcontextにも自動で反映する)の同期も
// 行うようにした。sync:falseにすると、この呼び出しで書いた値は
// 「書いた瞬間のスナップショット」のまま固定される(以後ink側で変わっても
// 追従しない)。
//
// notifyは「実行中の#wait:/type_wait推定待ちを即座に打ち切り、
// event_loop等の#interrupt付き選択肢に辿り着き次第それを自動選択する」
// というイベントトリガーとしての役割だけに専念する(値の同期自体はsyncが
// 担当する、完全に独立した軸になった)。
//
// Story自体へのアクセス権(ObserveVariableを実際に呼ぶ部分)は、
// core/managers/interruptManager.tsのInterruptHostと同じ考え方で、
// StepProvider実装(core/staticStepProvider.ts等)側がStory生成直後に
// attachStory()で「observeVariableだけを行える権限」を渡してくる。
// contextManager自体はStoryインスタンスを持たない。
import * as waitManager from "./waitManager";
import { getReservedVariableNames } from "../reservedVariablesConfig";
const contextStore = new Map();
const lastWakeAt = new Map();
const WAKE_THROTTLE_MS = 50;
// sync対象として観測開始済みの変数名(atomKeyごと)。同じ変数へ
// ObserveVariableを二重登録しないための管理。
const syncedVarNames = new Map();
// attachStory()がまだ呼ばれていない(Story未生成)段階でsync対象になった
// 変数を、attach後にまとめて登録するための保留リスト。
const pendingSyncVarNames = new Map();
const hosts = new Map();
function getStoreRecord(atomKey) {
    let record = contextStore.get(atomKey);
    if (!record) {
        record = {};
        contextStore.set(atomKey, record);
    }
    return record;
}
function getSyncedSet(atomKey) {
    let set = syncedVarNames.get(atomKey);
    if (!set) {
        set = new Set();
        syncedVarNames.set(atomKey, set);
    }
    return set;
}
function getPendingSyncSet(atomKey) {
    let set = pendingSyncVarNames.get(atomKey);
    if (!set) {
        set = new Set();
        pendingSyncVarNames.set(atomKey, set);
    }
    return set;
}
function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
// varsを「ink変数名 → 値」の1階層フラットな形に変換する。
//   flattenVars({ weather: { temp: 22.2, text: "晴れ" } })
//     → { weather_temp: 22.2, weather_text: "晴れ" }
//   flattenVars({ hp: 100 })
//     → { hp: 100 } (元々フラットな値はそのまま)
// keyNamesで個別の変数名を上書きできる(vars/keyNamesは同じ構造で辿る)。
export function flattenVars(vars, keyNames, prefix) {
    const result = {};
    for (const [key, value] of Object.entries(vars)) {
        const override = keyNames?.[key];
        if (isPlainObject(value)) {
            const nestedKeyNames = isPlainObject(override)
                ? override
                : undefined;
            // overrideが文字列の場合、その値をこのネストしたオブジェクト全体の
            // 新しいprefixとして使う("weather"→"w"のように途中の階層名だけ
            // 差し替えたいケース向け)。無ければ既定通りprefix_keyを積み重ねる。
            const nestedPrefix = typeof override === "string"
                ? override
                : prefix
                    ? `${prefix}_${key}`
                    : key;
            Object.assign(result, flattenVars(value, nestedKeyNames, nestedPrefix));
            continue;
        }
        const flatKey = typeof override === "string"
            ? override
            : prefix
                ? `${prefix}_${key}`
                : key;
        result[flatKey] = value;
    }
    return result;
}
// notify()が短時間(mousemove等)に大量連続で呼ばれた場合の保険。値の
// 書き込み自体は毎回やる(データとしては欠けない)が、「実行中のwait/
// type_wait待ちを打ち切る」効果の方は一定間隔に間引く。単発の本来の
// 使い方(クリック等)ではこの間隔より間が空くのが普通なので体感には
// 影響しない。
function wake(atomKey) {
    const now = Date.now();
    const last = lastWakeAt.get(atomKey) ?? 0;
    if (now - last < WAKE_THROTTLE_MS)
        return;
    lastWakeAt.set(atomKey, now);
    waitManager.interrupt(atomKey);
}
// このVNインスタンスのStoryが生成された直後、core/staticStepProvider.ts
// (または将来のサーバー版)側から1回呼ばれる。attachより前にsync対象として
// 登録済みの変数があれば、この時点でまとめて観測を開始する。
export function attachStory(atomKey, host) {
    hosts.set(atomKey, host);
    const pending = pendingSyncVarNames.get(atomKey);
    if (pending) {
        for (const varName of pending) {
            startObserving(atomKey, varName);
        }
        pending.clear();
    }
}
function startObserving(atomKey, varName) {
    const synced = getSyncedSet(atomKey);
    if (synced.has(varName))
        return;
    const host = hosts.get(atomKey);
    if (!host) {
        // Story未生成(init()完了前にsetContextが呼ばれた等)。attachStory()側で
        // 後追い登録できるよう保留しておく。
        getPendingSyncSet(atomKey).add(varName);
        return;
    }
    synced.add(varName);
    host.observeVariable(varName, (value) => {
        getStoreRecord(atomKey)[varName] = value;
    });
}
// setContextVars(vars, options?)の下ごしらえ。
//   1. varsをkeyNamesに従ってフラット化する(上記flattenVars参照)。
//   2. notifyならwake()する(#interrupt起動用のイベントマーク、値の同期とは無関係)。
//   3. 値を常にローカルストア(getContextVars()から見える値)へ反映する
//      (expose廃止、常時公開)。
//   4. sync(既定true)な変数は、以後ink側でその変数が変わった時も
//      ローカルストアへ反映されるようObserveVariableを(初回だけ)登録する。
// 戻り値は「実際にink変数へ書き込むべき値」。
export function prepareWrite(atomKey, vars, options) {
    let toWrite = flattenVars(vars, options?.keyNames);
    const reserved = getReservedVariableNames();
    toWrite = Object.fromEntries(Object.entries(toWrite).filter(([key]) => !reserved.has(key)));
    if (options?.notify) {
        wake(atomKey);
    }
    const store = getStoreRecord(atomKey);
    Object.assign(store, toWrite);
    const sync = options?.sync ?? true;
    if (sync) {
        for (const varName of Object.keys(toWrite)) {
            startObserving(atomKey, varName);
        }
    }
    return toWrite;
}
export function getContextVars(atomKey, varNames) {
    const store = getStoreRecord(atomKey);
    if (!varNames || varNames.length === 0) {
        return { ...store };
    }
    const result = {};
    for (const name of varNames) {
        result[name] = store[name];
    }
    return result;
}
// 簡易セーブ機能(core/SaveProvider.ts)の復元専用。exposeされた値の写しを
// そのまま置き換える(story.state.LoadJson()自体はink実行状態を復元するが、
// vnlayer側のこのキャッシュは別枠で保存/復元する必要があるため)。
// 復元後、sync対象の変数を再度observe登録し直す必要はない
// (attachStory()がinit()完了直後に必ず呼ばれ、その時点でまだ
// syncedVarNamesが空なので、次にその変数がsetContextされた時に
// 自然に登録される。復元直後にink側で値が変わった場合を厳密に
// 追従したい場合は、呼び出し側が復元直後にもう一度同じ変数名で
// setContextしてsync登録を再開するとよい)。
export function hydrate(atomKey, vars) {
    contextStore.set(atomKey, { ...vars });
}
// resetStory()用。値だけでなく、observe登録状況(syncedVarNames/
// pendingSyncVarNames)もクリアする。resetStory()はcore/staticStepProvider.ts
// 側でStoryインスタンス自体を再生成する(=attachStory()が新しいhostで
// 再度呼ばれる)ため、ここをクリアしておかないと「既に観測済み」と
// 誤判定されて新しいStoryへのObserveVariable登録がスキップされてしまう
// (=リセット後、ink側の変数変更がcontextに反映されなくなる不具合になる)。
export function reset(atomKey) {
    contextStore.set(atomKey, {});
    syncedVarNames.delete(atomKey);
    pendingSyncVarNames.delete(atomKey);
}
export function dispose(atomKey) {
    contextStore.delete(atomKey);
    lastWakeAt.delete(atomKey);
    syncedVarNames.delete(atomKey);
    pendingSyncVarNames.delete(atomKey);
    hosts.delete(atomKey);
}
//# sourceMappingURL=contextManager.js.map