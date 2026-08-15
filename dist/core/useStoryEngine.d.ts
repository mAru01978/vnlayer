import type { StepProvider } from "./StepProvider";
import type { SaveProvider } from "./SaveProvider";
import type { StoryEngine } from "./types";
export declare function useStoryEngine(
  clip: string,
  options?: {
    stepProvider?: StepProvider;
    saveProvider?: SaveProvider | null;
    onNavigate?: (path: string) => void;
    instanceId?: string;
  },
): StoryEngine;
//# sourceMappingURL=useStoryEngine.d.ts.map
