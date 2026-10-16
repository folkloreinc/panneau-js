import { use } from 'react';

import { ActionRunnerContext } from './context';
import type { ActionOutcome, ActionTarget, FollowedRun } from './types';

/**
 * Runs the actions of a resource through the closest `ActionRunnerProvider`. The function takes a
 * list's `ListActionEvent`, so it is the `onAction` of a list:
 *
 * ```tsx
 * const runAction = useActionRunner('pages');
 * <ListView list={list} items={items} actions={actions} onAction={runAction} />
 * ```
 *
 * It resolves once the action has run, has been queued or has navigated, with `false` when the
 * user cancelled its parameters (a list then keeps its selection), and rejects when it failed.
 */
export function useActionRunner(
    resource: string,
): (target: ActionTarget) => Promise<ActionOutcome | false> {
    const context = use(ActionRunnerContext);
    if (context === null) {
        throw new Error('useActionRunner() must be used inside <ActionRunnerProvider>.');
    }
    return (target) => context.run(resource, target);
}

/** The queued runs of the closest `ActionRunnerProvider`, to cancel or dismiss them. */
export function useActionRuns(): {
    runs: readonly FollowedRun[];
    cancel: (id: string) => Promise<void>;
    dismiss: (id: string) => void;
} {
    const context = use(ActionRunnerContext);
    if (context === null) {
        throw new Error('useActionRuns() must be used inside <ActionRunnerProvider>.');
    }
    return { runs: context.runs, cancel: context.cancelRun, dismiss: context.dismissRun };
}
