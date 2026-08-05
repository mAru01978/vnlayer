export type BacklogMode = "perInstance" | "global";
export type UiConfig = {
    messageWindow: {
        skin?: string;
        interactive: boolean;
        offset: number;
        autoHideOnCharHide: boolean;
        autoHideOnBgChange: boolean;
    };
    choice: {
        skin?: string;
        spacing?: number;
        anchor?: string;
        offset?: number;
        interactive: boolean;
        autoClearOnChoose: boolean;
    };
    backlog: {
        skin?: string;
        mode: BacklogMode;
        show: boolean;
        anchor?: string;
        offset?: number;
    };
    character: {
        clickable: boolean;
    };
    font: {
        family?: string;
        sizePx?: number;
    };
    stage: {
        stickToViewport: boolean;
        heightPx?: number;
        widthPx?: number;
    };
};
export type UiConfigPatch = {
    messageWindow?: Partial<UiConfig["messageWindow"]>;
    choice?: Partial<UiConfig["choice"]>;
    backlog?: Partial<UiConfig["backlog"]>;
    character?: Partial<UiConfig["character"]>;
    font?: Partial<UiConfig["font"]>;
    stage?: Partial<UiConfig["stage"]>;
};
export declare function setUiConfig(patch: UiConfigPatch, scope?: string): void;
export declare function getUiConfig(scope?: string): UiConfig;
//# sourceMappingURL=uiConfig.d.ts.map