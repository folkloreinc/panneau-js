import { createContext } from 'react';

import type { ActionAdapter, ActionOutcome, ActionTarget, FollowedRun } from './types';

export interface ActionRunnerContextValue {
    adapter: ActionAdapter;
    run: (resource: string, target: ActionTarget) => Promise<ActionOutcome | false>;
    runs: readonly FollowedRun[];
    cancelRun: (id: string) => Promise<void>;
    dismissRun: (id: string) => void;
}

export const ActionRunnerContext = createContext<ActionRunnerContextValue | null>(null);
