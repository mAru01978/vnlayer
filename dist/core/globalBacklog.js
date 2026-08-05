let entries = [];
let seq = 0;
const listeners = new Set();
function notify() {
    listeners.forEach((listener) => listener());
}
export function pushGlobalBacklogEntry(entry, instanceId) {
    seq += 1;
    entries = [...entries, { ...entry, instanceId, seq }];
    notify();
}
// #ui:backlog:clear がmode:'global'のインスタンスから呼ばれた時用。
// 全VN共通のログなので、どのインスタンスから呼んでも全体をクリアする。
export function clearGlobalBacklog() {
    entries = [];
    notify();
}
export function getGlobalBacklogEntries() {
    return entries;
}
export function subscribeGlobalBacklog(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
//# sourceMappingURL=globalBacklog.js.map