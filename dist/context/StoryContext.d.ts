import { type ReactNode } from "react";
import type { StepProvider } from "../core/StepProvider";
import type { SaveProvider } from "../core/SaveProvider";
export declare const StoryProvider: ({ children, clip, stepProvider, saveProvider, onNavigate, instanceId, }: {
    children: ReactNode;
    clip?: string;
    stepProvider?: StepProvider;
    saveProvider?: SaveProvider | null;
    onNavigate?: (path: string) => void;
    instanceId?: string;
}) => import("react").JSX.Element;
export declare const useStory: () => import("../core/types").StoryEngine;
//# sourceMappingURL=StoryContext.d.ts.map