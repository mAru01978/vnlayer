const registry = new Map();
function getList(atomKey) {
    let list = registry.get(atomKey);
    if (!list) {
        list = [];
        registry.set(atomKey, list);
    }
    return list;
}
function normalizeName(name) {
    return name.replace(/^@/, '');
}
function finish(atomKey, entry) {
    const list = registry.get(atomKey);
    if (list) {
        const idx = list.indexOf(entry);
        if (idx !== -1)
            list.splice(idx, 1);
    }
    entry.onDone.forEach((fn) => fn());
    entry.onDone.clear();
}
// timeline作成直後に呼ぶ。自然完了(onComplete)時に自動でunregisterされる。
// 呼び出し側が自前でtimeline.kill()する場合は、その直後に必ず
// unregister(atomKey, timeline)も呼ぶこと(呼ばないとwaitForIdle()が
// 「もう動いていないtimeline」を待ち続けてしまう)。
export function register(atomKey, name, timeline) {
    const entry = { name: normalizeName(name), timeline, onDone: new Set() };
    getList(atomKey).push(entry);
    timeline.eventCallback('onComplete', () => finish(atomKey, entry));
}
export function unregister(atomKey, timeline) {
    const list = registry.get(atomKey);
    if (!list)
        return;
    const entry = list.find((e) => e.timeline === timeline);
    if (entry)
        finish(atomKey, entry);
}
export function pauseAll(atomKey) {
    for (const entry of getList(atomKey))
        entry.timeline.pause();
}
export function resumeAll(atomKey) {
    for (const entry of getList(atomKey))
        entry.timeline.resume();
}
export function killByName(atomKey, name) {
    const target = normalizeName(name);
    for (const entry of [...getList(atomKey)]) {
        if (entry.name === target) {
            entry.timeline.kill();
            finish(atomKey, entry);
        }
    }
}
export function killAll(atomKey) {
    for (const entry of [...getList(atomKey)]) {
        entry.timeline.kill();
    }
    registry.set(atomKey, []);
}
// #wait:timeline 用。呼ばれた瞬間にactiveな全timelineのスナップショットを
// 取り、それら全部が完了(自然完了 or kill経由のunregister)するまで待つ。
// 呼び出し後に新しく始まったtimelineは対象に含まない。
export function waitForIdle(atomKey) {
    const list = [...getList(atomKey)];
    if (list.length === 0)
        return Promise.resolve();
    return new Promise((resolve) => {
        let remaining = list.length;
        const onOneDone = () => {
            remaining -= 1;
            if (remaining <= 0)
                resolve();
        };
        for (const entry of list) {
            entry.onDone.add(onOneDone);
        }
    });
}
export function isIdle(atomKey) {
    return getList(atomKey).length === 0;
}
export function reset(atomKey) {
    killAll(atomKey);
}
export function dispose(atomKey) {
    killAll(atomKey);
    registry.delete(atomKey);
}
//# sourceMappingURL=timelineManager.js.map