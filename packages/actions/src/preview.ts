import type { ActionAdapter, ActionTarget } from './types';

/** What a dry run of an action told: how many items it would apply to, and skip. */
export interface ActionPreview {
    succeeded: number;
    skipped: number;
}

/**
 * Whether the backend can say what an action would do before it runs: a `server` action with
 * `dryRun`, on every item matching a query. Selected ids need no dry run, since the list knows
 * their abilities.
 */
export function canPreviewAction(target: ActionTarget): boolean {
    const { action, selection } = target;
    return (
        action.dryRun === true &&
        action.kind === 'server' &&
        selection !== undefined &&
        'query' in selection
    );
}

/**
 * Asks the backend what an action would do on a query selection, without running it (a dry run,
 * `"dryRun": true` in the request), and resolves with the counts of its summary, or with `null`
 * for an action that can't be previewed (`canPreviewAction()`).
 */
export async function previewAction(
    adapter: Pick<ActionAdapter, 'runAction'>,
    resource: string,
    target: ActionTarget,
    options: { signal?: AbortSignal } = {},
): Promise<ActionPreview | null> {
    if (!canPreviewAction(target)) {
        return null;
    }
    const response = await adapter.runAction(
        resource,
        target.action.id,
        { selection: target.selection, dryRun: true },
        options,
    );
    const summary = response.result?.summary;
    return summary !== undefined
        ? { succeeded: summary.succeeded, skipped: summary.skipped }
        : null;
}
