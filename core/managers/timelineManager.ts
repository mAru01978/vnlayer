// GSAPのtimelineを一元管理するマネージャー。
//
// mockRenderer.tsx/StageView.tsxが作る全てのgsap.timeline()は、作成直後に
// ここへ register(atomKey, name, timeline) で登録し、自然完了時または
// 呼び出し側の明示的なkill()時に必ずunregister(atomKey, timeline)される
// (finish()関数が両方の経路を一本化している)。
//
// これにより将来、以下のようなタグが「このマネージャーを呼ぶだけ」で
// 実現できる(このファイル自体はまだそれらのタグを実装していない — 実装は
// tags/defs/special/timeline.ts、および#wait:timeline対応は
// tags/defs/special/wait.ts側):
//   #timeline:pause         → このVNインスタンスの演出中の全timelineを一時停止
//                              (#waitと違い、ink本文の進行自体は止めない)
//   #timeline:resume        → 一時停止した全timelineを再開
//   #timeline:kill:@name    → 名前を指定して特定のtimelineだけ強制終了
//                              ("@"は"#"の代わり。#emit等と同じ慣習)
//   #wait:timeline          → 現在進行中の全timelineが完了するまでink本文の
//                              進行を待つ(waitForIdle()を使う)
//
// 名前(name)は呼び出し側が自由に付ける識別子で、DOMのidやCSSセレクタとは
// 無関係。同じ名前を複数回登録してもよい(#timeline:kill:@nameは該当する
// 名前を持つtimeline全部を対象にする)。
import type gsapNS from "gsap";

type Entry = {
  name: string;
  timeline: gsap.core.Timeline;
  onDone: Set<() => void>;
};

const registry = new Map<string, Entry[]>();

function getList(atomKey: string): Entry[] {
  let list = registry.get(atomKey);
  if (!list) {
    list = [];
    registry.set(atomKey, list);
  }
  return list;
}

function normalizeName(name: string): string {
  return name.replace(/^@/, "");
}

function finish(atomKey: string, entry: Entry): void {
  const list = registry.get(atomKey);
  if (list) {
    const idx = list.indexOf(entry);
    if (idx !== -1) list.splice(idx, 1);
  }
  entry.onDone.forEach((fn) => fn());
  entry.onDone.clear();
}

// timeline作成直後に呼ぶ。自然完了(onComplete)時に自動でunregisterされる。
// 呼び出し側が自前でtimeline.kill()する場合は、その直後に必ず
// unregister(atomKey, timeline)も呼ぶこと(呼ばないとwaitForIdle()が
// 「もう動いていないtimeline」を待ち続けてしまう)。
export function register(
  atomKey: string,
  name: string,
  timeline: gsap.core.Timeline,
): void {
  const entry: Entry = {
    name: normalizeName(name),
    timeline,
    onDone: new Set(),
  };
  getList(atomKey).push(entry);
  timeline.eventCallback("onComplete", () => finish(atomKey, entry));
}

export function unregister(
  atomKey: string,
  timeline: gsap.core.Timeline,
): void {
  const list = registry.get(atomKey);
  if (!list) return;
  const entry = list.find((e) => e.timeline === timeline);
  if (entry) finish(atomKey, entry);
}

export function pauseAll(atomKey: string): void {
  for (const entry of getList(atomKey)) entry.timeline.pause();
}

export function resumeAll(atomKey: string): void {
  for (const entry of getList(atomKey)) entry.timeline.resume();
}

export function killByName(atomKey: string, name: string): void {
  const target = normalizeName(name);
  for (const entry of [...getList(atomKey)]) {
    if (entry.name === target) {
      entry.timeline.kill();
      finish(atomKey, entry);
    }
  }
}

export function killAll(atomKey: string): void {
  for (const entry of [...getList(atomKey)]) {
    entry.timeline.kill();
  }
  registry.set(atomKey, []);
}

// #wait:timeline 用。呼ばれた瞬間にactiveな全timelineのスナップショットを
// 取り、それら全部が完了(自然完了 or kill経由のunregister)するまで待つ。
// 呼び出し後に新しく始まったtimelineは対象に含まない。
export function waitForIdle(atomKey: string): Promise<void> {
  const list = [...getList(atomKey)];
  if (list.length === 0) return Promise.resolve();
  return new Promise((resolve) => {
    let remaining = list.length;
    const onOneDone = () => {
      remaining -= 1;
      if (remaining <= 0) resolve();
    };
    for (const entry of list) {
      entry.onDone.add(onOneDone);
    }
  });
}

export function isIdle(atomKey: string): boolean {
  return getList(atomKey).length === 0;
}

export function reset(atomKey: string): void {
  killAll(atomKey);
}

export function dispose(atomKey: string): void {
  killAll(atomKey);
  registry.delete(atomKey);
}
