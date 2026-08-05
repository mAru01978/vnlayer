/// <reference types="react" />
export type StageMode = 'full' | 'overlay';
export type UiAnchor = 'left' | 'right';
export type UiVisibility = {
    backlogButton?: boolean;
    choices?: boolean;
    messageWindow?: boolean;
};
export default function StageView({ mode, uiAnchor, showUi, }: {
    mode?: StageMode;
    uiAnchor?: UiAnchor;
    showUi?: boolean | UiVisibility;
}): import("react").JSX.Element;
//# sourceMappingURL=StageView.d.ts.map