import { type AggregateRequest, HOME_PAGE, type ListQuery } from '@panneau/protocol';

/** What the data of a widget is keyed by besides its id: its dashboard page. */
export interface WidgetKeyOptions {
    /** The dashboard page of the widget. Defaults to `home`. */
    page?: string;
}

/** What a search is keyed by besides its query: its `limit` and `resources`. */
export interface SearchKeyOptions {
    limit?: number;
    resources?: readonly string[];
}

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
    /** The aggregates of a resource: its lists invalidate them too, when its items change. */
    aggregates: (resource: string) => ['panneau', 'resources', resource, 'aggregate'] as const,
    aggregate: (resource: string, request: AggregateRequest = {}) =>
        ['panneau', 'resources', resource, 'aggregate', request] as const,
    items: (resource: string) => ['panneau', 'resources', resource, 'item'] as const,
    item: (resource: string, id: string) => ['panneau', 'resources', resource, 'item', id] as const,
    /** Under the item's key: refetching or invalidating the item refreshes its preview. */
    itemPreview: (resource: string, id: string, values: Record<string, unknown> = {}) =>
        ['panneau', 'resources', resource, 'item', id, 'preview', values] as const,
    /** Under `['panneau', 'search']`: invalidating it refreshes every search. */
    search: (q: string, options: SearchKeyOptions = {}) =>
        ['panneau', 'search', q, options] as const,
    /** The current user's account, and under it their two-factor authentication. */
    account: () => ['panneau', 'account'] as const,
    twoFactor: () => ['panneau', 'account', 'two-factor'] as const,
    passkeys: () => ['panneau', 'account', 'passkeys'] as const,
    /**
     * Under `['panneau', 'dashboard']`: invalidating it refreshes every widget, of every page.
     * Without a page, the widget of the home page.
     */
    widget: (widget: string, { page = HOME_PAGE }: WidgetKeyOptions = {}) =>
        ['panneau', 'dashboard', 'widgets', widget, { page }] as const,
    actionRuns: () => ['panneau', 'actions', 'runs'] as const,
    actionRun: (id: string) => ['panneau', 'actions', 'runs', id] as const,
};
