export type BacklogMode = 'perInstance' | 'global';
export type UiConfig = {
    messageWindow: {
        skin?: string;
    };
    choice: {
        skin?: string;
        spacing?: number;
        anchor?: string;
    };
    backlog: {
        skin?: string;
        mode: BacklogMode;
    };
};
export type UiConfigPatch = {
    messageWindow?: Partial<UiConfig['messageWindow']>;
    choice?: Partial<UiConfig['choice']>;
    backlog?: Partial<UiConfig['backlog']>;
};
export declare function setUiConfig(partial: UiConfigPatch): void;
export declare function getUiConfig(): UiConfig;
//# sourceMappingURL=uiConfig.d.ts.map