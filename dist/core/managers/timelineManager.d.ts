export declare function register(
  atomKey: string,
  name: string,
  timeline: gsap.core.Timeline,
): void;
export declare function unregister(
  atomKey: string,
  timeline: gsap.core.Timeline,
): void;
export declare function pauseAll(atomKey: string): void;
export declare function resumeAll(atomKey: string): void;
export declare function killByName(atomKey: string, name: string): void;
export declare function killAll(atomKey: string): void;
export declare function waitForIdle(atomKey: string): Promise<void>;
export declare function isIdle(atomKey: string): boolean;
export declare function reset(atomKey: string): void;
export declare function dispose(atomKey: string): void;
//# sourceMappingURL=timelineManager.d.ts.map
