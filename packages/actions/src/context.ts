import { createContext } from 'react';

import type { ActionAdapter, ActionOutcome, ActionTarget, FollowedRun } from './types';

export interface ActionRunnerContextValue {
    adapter: ActionAdapter;
    run: (resource: string, target: ActionTarget) => Promise<ActionOutcome | false>;
    runs: readonly FollowedRun[];
    cancelRun: (id: string) => Promise<void>;
    dismissRun: (id: string) => void;
    /**
     * Says that a list of the runs is on screen, until the function it returns is called: a run
     * that ends there needs no toast.
     */
    watchRuns: () => () => void;
}

export const ActionRunnerContext = createContext<ActionRunnerContextValue | null>(null);
