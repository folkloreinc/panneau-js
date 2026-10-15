import type { ListQuery } from '@panneau/protocol';

/**
 * Query keys of the hooks, to read, prefetch or invalidate their data with the query client.
 * Keys are nested: invalidating `queryKeys.resource('pages')` covers its lists and items.
 */
export const queryKeys = {
    all: ['panneau'] as const,
    definition: () => ['panneau', 'definition'] as const,
    resource: (resource: string) => ['panneau', 'resources', resource] as const,
    lists: (resource: string) => ['panneau', 'resources', resource, 'list'] as const,
    list: (resource: string, query: ListQuery = {}) =>
        ['panneau', 'resources', resource, 'list', query] as const,
    items: (resource: string) => ['panneau', 'resources', resource, 'item'] as const,
    item: (resource: string, id: string) => ['panneau', 'resources', resource, 'item', id] as const,
    actionRuns: () => ['panneau', 'actions', 'runs'] as const,
    actionRun: (id: string) => ['panneau', 'actions', 'runs', id] as const,
};
