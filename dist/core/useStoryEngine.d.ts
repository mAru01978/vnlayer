import type { StepProvider } from './StepProvider';
import type { StoryEngine } from './types';
export declare function useStoryEngine(scenario: string, options?: {
    stepProvider?: StepProvider;
    onNavigate?: (path: string) => void;
}): StoryEngine;
//# sourceMappingURL=useStoryEngine.d.ts.map