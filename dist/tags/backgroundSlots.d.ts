export type BackgroundSlot = {
    color?: string;
    image?: string;
};
export declare function setBackgroundSlots(next: Record<string, BackgroundSlot>): void;
export declare function setBackgroundResolver(fn: (name: string) => BackgroundSlot | undefined): void;
export declare function getBackgroundSlot(name: string): BackgroundSlot | undefined;
export declare function getAllBackgroundSlots(): Record<string, BackgroundSlot>;
//# sourceMappingURL=backgroundSlots.d.ts.map