import { type ReactNode } from "react";
import type { StepProvider } from "../core/StepProvider";
export declare const StoryProvider: ({ children, clip, stepProvider, onNavigate, instanceId, }: {
    children: ReactNode;
    clip?: string;
    stepProvider?: StepProvider;
    onNavigate?: (path: string) => void;
    instanceId?: string;
}) => import("react").JSX.Element;
export declare const useStory: () => import("../core/types").StoryEngine;
//# sourceMappingURL=StoryContext.d.ts.map