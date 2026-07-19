// このファイルはinkjsのStory APIだけに依存し、fsやserver-only、fetch等には
// 一切触れない。そのため:
//   - lib/story/server/engine.ts (Next.jsサーバー、Node環境)
//   - VNLayer/core/staticStepProvider.ts (ブラウザ、静的運用)
// の両方から同じ関数をimportして使う。ロジックを二重管理するとバグ修正が
// 片方にしか反映されない事故が起きるため(実際に過去そうなった)、必ずここを共有すること。
// s タグは話者に解決済みなので結果のtagsには含めない。
// _ref を使っていたタグ(cam:zoom:_ref 等)は、呼び出し側が解決済みの値で渡すこと。
export function continueUntilChoice(story, initialVisual) {
    const steps = [];
    let currentSpeakerForLine = initialVisual.speaker;
    const visual = {
        bg: initialVisual.bg,
        characters: { ...initialVisual.characters },
        speaker: initialVisual.speaker,
    };
    const resolveRef = (tagKey) => tagKey === 's'
        ? String(story.variablesState['ref_speaker'] ?? '')
        : String(story.variablesState['ref_target'] ?? '');
    try {
        while (story.canContinue) {
            const line = story.Continue();
            const rawTags = story.currentTags ?? [];
            const sTag = rawTags.find((t) => t.split(':')[0] === 's');
            if (sTag) {
                const rawTarget = sTag.split(':')[1];
                currentSpeakerForLine = rawTarget === '_ref' ? resolveRef('s') : rawTarget;
            }
            const remainingTags = rawTags
                .filter((t) => t.split(':')[0] !== 's')
                .map((t) => {
                const [key, ...rest] = t.split(':');
                const resolvedRest = rest.map((a) => (a === '_ref' ? resolveRef(key) : a));
                return [key, ...resolvedRest].join(':');
            });
            for (const tag of remainingTags) {
                const [key, ...rest] = tag.split(':');
                if (key === 'bg') {
                    visual.bg = rest[0] ?? '';
                }
                else if (key === 'c') {
                    const [name, expression] = rest;
                    if (name) {
                        visual.characters[name] = {
                            ...visual.characters[name],
                            expression: expression ?? 'normal',
                            motion: visual.characters[name]?.motion,
                        };
                    }
                }
                else if (key === 'anim') {
                    const [name, motion] = rest;
                    if (name) {
                        visual.characters[name] = {
                            ...visual.characters[name],
                            expression: visual.characters[name]?.expression ?? 'normal',
                            motion,
                            animLoop: false,
                            animReverse: false,
                        };
                    }
                }
                else if (key === 'anim_loop') {
                    const [name, motion] = rest;
                    if (name) {
                        visual.characters[name] = {
                            ...visual.characters[name],
                            expression: visual.characters[name]?.expression ?? 'normal',
                            motion,
                            animLoop: true,
                            animReverse: false,
                        };
                    }
                }
                else if (key === 'anim_stop') {
                    const [name] = rest;
                    if (name && visual.characters[name]) {
                        visual.characters[name] = {
                            ...visual.characters[name],
                            motion: undefined,
                            animLoop: false,
                            animReverse: false,
                        };
                    }
                }
                else if (key === 'anim_speed') {
                    // ラベル(slow/normal/fast等)→倍率の解決はtags/defs/anim_speed.ts側の
                    // 責務なので、ここ(タグ設定を知らない共有ランナー)では生の数値で
                    // 書かれている場合だけ反映する。ラベルで指定された場合、この
                    // visualスナップショットには反映されない(実際のタグ処理
                    // (useStoryEngine側)では正しく解決されるので、影響があるのは
                    // リロード直後の一瞬だけの見た目に限られる)。
                    const [name, speedArg] = rest;
                    const speedNum = Number(speedArg);
                    if (name && Number.isFinite(speedNum)) {
                        visual.characters[name] = {
                            ...visual.characters[name],
                            expression: visual.characters[name]?.expression ?? 'normal',
                            animSpeed: speedNum,
                        };
                    }
                }
                else if (key === 'anim_reverse') {
                    const [name, motion] = rest;
                    if (name) {
                        visual.characters[name] = {
                            ...visual.characters[name],
                            expression: visual.characters[name]?.expression ?? 'normal',
                            motion,
                            animReverse: true,
                        };
                    }
                }
                else if (key === 'hide') {
                    const [name] = rest;
                    if (name)
                        delete visual.characters[name];
                }
            }
            visual.speaker = currentSpeakerForLine;
            const trimmed = line ? line.trim() : '';
            if (trimmed.length > 0 || remainingTags.length > 0) {
                steps.push({ speaker: currentSpeakerForLine, content: trimmed, tags: remainingTags });
            }
        }
    }
    catch (e) {
        console.warn('[inkStepRunner] runtime error during Continue(), stopping here:', e);
    }
    const choices = story.currentChoices.map((c, i) => ({
        text: c.text,
        index: i,
        tags: c.tags ?? [],
    }));
    return { steps, choices, visual };
}
//# sourceMappingURL=inkStepRunner.js.map