import type { Story } from "inkjs";
import type { RunResult, StepEntry, VisualState } from "./types";

// このファイルはinkjsのStory APIだけに依存し、fsやserver-only、fetch等には
// 一切触れない。そのため:
//   - lib/story/server/engine.ts (Next.jsサーバー、Node環境)
//   - VNLayer/core/staticStepProvider.ts (ブラウザ、静的運用)
// の両方から同じ関数をimportして使う。ロジックを二重管理するとバグ修正が
// 片方にしか反映されない事故が起きるため(実際に過去そうなった)、必ずここを共有すること。

// #s は「話者+表情+位置+表示/非表示」の統合タグ。話者抽出(currentSpeakerForLine)
// のためだけに特別扱いしていた以前と違い、今はremainingTagsからも除外しない
// (表情/pos/hideの反映はtags/defs/s.tsのrun()側で行うため、dispatchTagにも
// 渡す必要がある)。
// _ref を使っていたタグ(cam:zoom:_ref 等)は、呼び出し側が解決済みの値で渡すこと。
export function continueUntilChoice(
  story: Story,
  initialVisual: VisualState,
): RunResult {
  const steps: StepEntry[] = [];
  let currentSpeakerForLine = initialVisual.speaker;
  const visual: VisualState = {
    bg: initialVisual.bg,
    characters: { ...initialVisual.characters },
    speaker: initialVisual.speaker,
  };

  const resolveRef = (tagKey: string) =>
    tagKey === "s"
      ? String(story.variablesState["ref_speaker"] ?? "")
      : String(story.variablesState["ref_target"] ?? "");

  // _ref は「s(話者)/cam等、タグごとに決まった1つの変数」を指す専用の解決だが、
  // gazeのように1つのタグで複数の異なる変数(mouse_x, mouse_y)を都度差し込みたい
  // 場合には使えない。そこで任意の変数名を指定できる汎用の記法として
  // _var_<変数名> を追加する(例: gaze:alice:_var_mouse_x:_var_mouse_y)。
  // inkのタグは{変数}のような実行時展開をしない(このファイル冒頭のコメント、
  // および_ref自体がその制約を避けるための仕組みであることからも分かる通り)ため、
  // タグの中で動的な値を使いたい場合は必ずこの手の明示的な解決が必要になる。
  const VAR_TAG_PREFIX = "_var_";
  const resolveVar = (arg: string) =>
    String(story.variablesState[arg.slice(VAR_TAG_PREFIX.length)] ?? "");

  try {
    while (story.canContinue) {
      const line = story.Continue();
      const rawTags = story.currentTags ?? [];

      // 先に全タグの_ref/_var_解決を済ませてしまう(sタグも含む)。
      const remainingTags = rawTags.map((t) => {
        const [key, ...rest] = t.split(":");
        const resolvedRest = rest.map((a) => {
          if (a === "_ref") return resolveRef(key);
          if (a.startsWith(VAR_TAG_PREFIX)) return resolveVar(a);
          return a;
        });
        return [key, ...resolvedRest].join(":");
      });

      // 話者抽出は解決済みのsタグから行う(2番目のセグメントが話者名)。
      // 重要: inkjsは文章を挟まない連続したタグ行を1回のContinue()に
      // まとめてcurrentTagsとして返すことがある(例: 前の知の末尾の
      // # s:alice:hide と、-> 診断先の知の先頭の # s:mika:normal が
      // 間に文章が無いために同じ束としてまとまってしまう)。この場合、
      // 「最初に見つかったsタグ」を採用すると古い話者(alice)のまま
      // 固定されてしまうバグになるため、必ず「最後に見つかったsタグ」を
      // 採用する(後に書かれたものが優先される、というinkスクリプトの
      // 上から下への読み方と一致させる)。
      const sTags = remainingTags.filter((t) => t.split(":")[0] === "s");
      if (sTags.length > 0) {
        currentSpeakerForLine = sTags[sTags.length - 1].split(":")[1];
      }

      for (const tag of remainingTags) {
        const [key, ...rest] = tag.split(":");
        if (key === "bg") {
          visual.bg = rest[0] ?? "";
        } else if (key === "s") {
          // # s:name / # s:name:hide / # s:name:pos:... / # s:name:<表情>
          const [name, mode] = rest;
          if (!name || mode === undefined) continue; // 話者だけの指定は見た目に影響しない
          if (mode === "hide") {
            delete visual.characters[name];
          } else if (mode === "pos") {
            // 位置はStageView側がpositionOverrides経由で別管理してるので、
            // このvisualスナップショット(bg/表情/モーション用)には含めない。
          } else {
            // hide/pos以外 = 表情指定
            visual.characters[name] = {
              ...visual.characters[name],
              expression: mode,
              motion: visual.characters[name]?.motion,
            };
          }
        } else if (key === "anim") {
          // # anim:name:motion:xxx / loop:xxx / stop / speed:xxx / reverse:xxx
          const [name, mode, value] = rest;
          if (!name || !mode) continue;
          if (mode === "motion") {
            visual.characters[name] = {
              ...visual.characters[name],
              expression: visual.characters[name]?.expression ?? "normal",
              motion: value,
              animLoop: false,
              animReverse: false,
            };
          } else if (mode === "loop") {
            visual.characters[name] = {
              ...visual.characters[name],
              expression: visual.characters[name]?.expression ?? "normal",
              motion: value,
              animLoop: true,
              animReverse: false,
            };
          } else if (mode === "stop") {
            if (visual.characters[name]) {
              visual.characters[name] = {
                ...visual.characters[name],
                motion: undefined,
                animLoop: false,
                animReverse: false,
              };
            }
          } else if (mode === "speed") {
            // ラベル(slow/normal/fast等)→倍率の解決はtags/defs/anim.ts側の
            // 責務なので、ここ(タグ設定を知らない共有ランナー)では生の数値で
            // 書かれている場合だけ反映する。ラベルで指定された場合、この
            // visualスナップショットには反映されない(実際のタグ処理
            // (useStoryEngine側)では正しく解決されるので、影響があるのは
            // リロード直後の一瞬だけの見た目に限られる)。
            const speedNum = Number(value);
            if (Number.isFinite(speedNum)) {
              visual.characters[name] = {
                ...visual.characters[name],
                expression: visual.characters[name]?.expression ?? "normal",
                animSpeed: speedNum,
              };
            }
          } else if (mode === "reverse") {
            visual.characters[name] = {
              ...visual.characters[name],
              expression: visual.characters[name]?.expression ?? "normal",
              motion: value,
              animReverse: true,
            };
          }
        }
      }
      visual.speaker = currentSpeakerForLine;

      const trimmed = line ? line.trim() : "";
      if (trimmed.length > 0 || remainingTags.length > 0) {
        steps.push({
          speaker: currentSpeakerForLine,
          content: trimmed,
          tags: remainingTags,
        });
      }
    }
  } catch (e) {
    console.warn(
      "[inkStepRunner] runtime error during Continue(), stopping here:",
      e,
    );
  }

  const choices = story.currentChoices.map((c, i) => ({
    text: c.text,
    index: i,
    tags: c.tags ?? [],
  }));
  return { steps, choices, visual };
}
