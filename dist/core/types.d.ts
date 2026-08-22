export type Choice = {
    text: string;
    index: number;
    tags: string[];
};
export type CharacterState = {
    expression: string;
    motion?: string;
    animLoop?: boolean;
    animSpeed?: number;
    animReverse?: boolean;
    gaze?: {
        x: number;
        y: number;
    };
    zIndex?: number;
};
export type CamState = {
    target: string;
    scale: number;
    originX: number;
    originY: number;
};
export type ShakeState = {
    nonce: number;
    amplitude: number;
    duration: number;
};
export type LineEntry = {
    kind: "line";
    speaker: string;
    content: string;
} | {
    kind: "choice";
    number: number;
    text: string;
};
export type PositionOverrides = Record<string, {
    originX: number;
    originY: number;
    durationMs?: number;
}>;
export type ActiveMessage = {
    speaker: string;
    content: string;
    fadeIn: boolean;
    typeSpeedMs: number;
    startRevealed?: boolean;
} | null;
export type StepEntry = {
    speaker: string;
    content: string;
    tags: string[];
};
export type VisualState = {
    bg: string;
    bgZIndex?: number;
    characters: Record<string, CharacterState>;
    speaker: string;
};
export type RunResult = {
    steps: StepEntry[];
    choices: Choice[];
    visual: VisualState;
};
export type SetContextKeyNames = {
    [key: string]: string | SetContextKeyNames;
};
export type SetContextOptions = {
    notify?: boolean;
    sync?: boolean;
    keyNames?: SetContextKeyNames;
};
export type VNLayerHandle = {
    setContextVars: (vars: Record<string, unknown>, options?: SetContextOptions) => Promise<void>;
    getContextVars: (varNames?: string[]) => Promise<Record<string, unknown>>;
    resetStory: () => Promise<void>;
};
export type StoryEngine = {
    lines: LineEntry[];
    choices: Choice[];
    bg: string;
    bgZIndex?: number;
    characters: Record<string, CharacterState>;
    speaker: string;
    cam: CamState;
    shake: ShakeState;
    isProcessing: boolean;
    choose: (index: number) => Promise<void>;
    choicesHidden: boolean;
    messageWindowHidden: boolean;
    positionOverrides: PositionOverrides;
    activeMessage: ActiveMessage;
    hasLoadedOnce: boolean;
    resetStory: () => Promise<void>;
    flash: {
        color: string;
        durationMs: number;
    } | null;
    typeSpeedMs: number;
    setContextVars: (vars: Record<string, unknown>, options?: SetContextOptions) => Promise<void>;
    getContextVars: (varNames?: string[]) => Promise<Record<string, unknown>>;
    instanceId?: string;
    atomKey: string;
};
//# sourceMappingURL=types.d.ts.map