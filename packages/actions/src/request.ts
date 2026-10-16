import type { ActionRequest, ActionResult, RouteReference } from '@panneau/protocol';

import type { ActionTarget } from './types';

/** The request of an action: its selection (none for the resource), and its parameter values. */
export function buildActionRequest(
    target: ActionTarget,
    values: Record<string, unknown> = {},
): ActionRequest {
    if (target.scope === 'item' && target.item !== undefined) {
        return { selection: { ids: [target.item.id] }, values };
    }
    if (target.scope === 'selection' && target.selection !== undefined) {
        return { selection: target.selection, values };
    }
    return { values };
}

/** Where a `link` action goes: its `url` with `{id}` replaced, or its `route` with the item's id. */
export function getLinkTarget(target: ActionTarget): string | RouteReference | null {
    const { action, item } = target;
    if (action.url !== undefined) {
        if (action.url.includes('{id}') && item === undefined) {
            return null;
        }
        return item !== undefined
            ? action.url.replaceAll('{id}', encodeURIComponent(item.id))
            : action.url;
    }
    if (action.route !== undefined) {
        return { route: action.route, params: item !== undefined ? { id: item.id } : {} };
    }
    return null;
}

const FINISHED = new Set(['succeeded', 'partial', 'failed', 'cancelled']);

/** Whether a run has finished, successfully or not. */
export function isFinished(status: string): boolean {
    return FINISHED.has(status);
}

/** The counts of a result, from its summary or, without one, from its per-item results. */
export function getResultCounts(result: ActionResult): {
    succeeded: number | null;
    failed: number;
    skipped: number;
} {
    if (result.summary !== undefined) {
        return result.summary;
    }
    const results = result.results ?? [];
    return {
        succeeded: null,
        failed: results.filter((entry) => entry.status === 'failed').length,
        skipped: results.filter((entry) => entry.status === 'skipped').length,
    };
}
