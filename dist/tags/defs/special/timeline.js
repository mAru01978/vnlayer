import { registerTag, warnUnknownTag } from '../../registry';
import * as timelineManager from '../../../core/managers/timelineManager';
// GSAPのtimeline(core/managers/timelineManager.ts)を横断的に制御するタグ。
// #waitと違い、こちらはink本文の進行そのものは一切止めない
// (演出だけを止める/再開する/強制終了する)。
//
//   # timeline:pause         → このVNインスタンスの演出中の全timelineを一時停止
//   # timeline:resume        → 一時停止した全timelineを再開
//   # timeline:kill:@name    → 名前を指定して特定のtimelineだけ強制終了
//                              ("@"は"#"の代わり。#emit等と同じ慣習。
//                               nameはmockRenderer.tsx/StageView.tsx側で
//                               timelineManager.register()に渡している
//                               識別子: "bg" / "pos:<キャラ名>" /
//                               "gaze:<キャラ名>" / "anim:<キャラ名>" /
//                               "cam" / "shake" / "flash" 等)
//
// 「進行を止めるwait」と「演出だけ止めるtimeline:pause」を分けているのは、
// 例えば「ink側の選択肢待ちはそのままで、画面のシェイクだけ手動で止めたい」
// といった使い分けができるようにするため。
registerTag({
    key: 'timeline',
    run: ({ args, handlers }) => {
        const [action, name] = args;
        const atomKey = handlers.atomKey;
        switch (action) {
            case 'pause':
                timelineManager.pauseAll(atomKey);
                break;
            case 'resume':
                timelineManager.resumeAll(atomKey);
                break;
            case 'kill':
                if (!name) {
                    console.warn('[VNLayer] timeline:kill の書式が不正です(# timeline:kill:<name>): ' + args.join(':'));
                    break;
                }
                timelineManager.killByName(atomKey, name);
                break;
            default:
                warnUnknownTag(['timeline', action, name].filter(Boolean).join(':'));
        }
    },
});
//# sourceMappingURL=timeline.js.map