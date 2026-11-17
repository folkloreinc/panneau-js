import type { QueryClient } from '@tanstack/react-query';

import type { ActionResult, Selection } from '@panneau/protocol';

import { queryKeys } from './keys';

/**
 * Invalidates the lists of a resource, its aggregates, which count the same items, and the widgets
 * of its summary with data of their own (decision 0084).
 */
export async function invalidateLists(client: QueryClient, resource: string): Promise<void> {
    await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.lists(resource) }),
        client.invalidateQueries({ queryKey: queryKeys.aggregates(resource) }),
        client.invalidateQueries({
            queryKey: ['panneau', 'dashboard', 'widgets'],
            predicate: ({ queryKey }) => {
                const place = queryKey[4];
                return (
                    typeof place === 'object' &&
                    place !== null &&
                    (place as { resource?: unknown }).resource === resource
                );
            },
        }),
    ]);
}

/**
 * Invalidates the cached data that an action result asks to refresh:
 *
 * - `none`: nothing;
 * - `items`: the affected items (every item of the resource for a query selection), and the
 *   lists, which show them, with the aggregates;
 * - `list` (the default): every list and item of the resource.
 */
export async function invalidateActionResult(
    client: QueryClient,
    resource: string,
    result: ActionResult,
    selection?: Selection,
): Promise<void> {
    const refresh = result.refresh ?? 'list';
    if (refresh === 'none') {
        return;
    }
    if (refresh === 'list') {
        await client.invalidateQueries({ queryKey: queryKeys.resource(resource) });
        return;
    }
    const ids = selection !== undefined && 'ids' in selection ? (selection.ids as string[]) : null;
    await Promise.all([
        invalidateLists(client, resource),
        ...(ids === null
            ? [client.invalidateQueries({ queryKey: queryKeys.items(resource) })]
            : ids.map((id) =>
                  client.invalidateQueries({ queryKey: queryKeys.item(resource, id) }),
              )),
    ]);
}
