export type SceneHandlers = {
    setBg: (name: string) => void;
    setChar: (name: string, expression: string) => void;
    setAnim: (name: string, motion: string) => void;
    setAnimLoop: (name: string, motion: string) => void;
    setAnimStop: (name: string) => void;
    setAnimSpeed: (name: string, speed: number) => void;
    setAnimReverse: (name: string, motion: string) => void;
    setGaze: (name: string, target: {
        x: number;
        y: number;
    } | 'reset') => void;
    setSpeaker: (name: string) => void;
    onGoto: (path: string) => void;
    onOpen: (url: string) => void;
    onScroll: (target: string) => void;
    wait: (ms: number) => Promise<void>;
    setCamera: (scale: number, target: string | undefined, durationMs: number) => void;
    shakeScreen: (amplitude: number, durationMs: number) => void;
    onUnknownTag?: (tag: string) => void;
    hideChar: (name: string) => void;
    setChoicesVisible: (visible: boolean) => void;
    setMessageWindowVisible: (visible: boolean) => void;
    setPos: (name: string, coords: {
        originX: number;
        originY: number;
    } | 'reset', durationMs?: number) => void;
    clearLines: () => void;
    setMessageMode: (mode: 'transient' | 'persist' | 'hide', transientDurationMs?: number) => void;
    handleFlash: (color: string, durationMs: number) => void;
    setNextRevealFade: (fadeIn: boolean) => void;
    setTypeSpeed: (ms: number) => void;
    setTypeWaitMode: (enabled: boolean, readingBufferMs?: number) => void;
};
//# sourceMappingURL=sceneHandlers.d.ts.map