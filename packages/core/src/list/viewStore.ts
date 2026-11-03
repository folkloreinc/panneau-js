import type { ListQuery } from '@panneau/protocol';

/**
 * The view of a list: how it shows its items, not what it fetches (decision 0042). Each part is
 * left out while it is the list's default.
 */
export interface ListViewState {
    /** The layout chosen (`cards`). */
    layout?: string;
    /** The ids of the columns shown, in their order. */
    columns?: string[];
}

/**
 * What a list remembers of its last view: the filters, sort and page size of its query (not its
 * page, cursor or search), and its view.
 */
export interface RememberedView {
    query: Pick<ListQuery, 'filter' | 'sort' | 'perPage'>;
    view: ListViewState;
}

/**
 * Where lists remember their view, by key. `createStorageViewStore()` keeps them in the browser.
 * Reading is synchronous: a list restores its view before its first fetch.
 */
export interface ListViewStore {
    get(key: string): RememberedView | null;
    /** Saves the view of a list, or forgets it with `null`. */
    set(key: string, view: RememberedView | null): void;
}

const PREFIX = 'panneau:list:';

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((part) => typeof part === 'string');
}

/** Reads a stored view, leaving out what isn't one. */
function parseView(value: unknown): RememberedView | null {
    if (!isRecord(value) || !isRecord(value.query) || !isRecord(value.view)) {
        return null;
    }
    const { filter, sort, perPage } = value.query;
    const { layout, columns } = value.view;
    const query: RememberedView['query'] = {};
    if (isRecord(filter)) {
        query.filter = filter as NonNullable<ListQuery['filter']>;
    }
    if (isStringArray(sort)) {
        query.sort = sort;
    }
    if (typeof perPage === 'number' && Number.isInteger(perPage) && perPage > 0) {
        query.perPage = perPage;
    }
    const view: ListViewState = {};
    if (typeof layout === 'string' && layout !== '') {
        view.layout = layout;
    }
    if (isStringArray(columns) && columns.length > 0) {
        view.columns = columns;
    }
    return { query, view };
}

function defaultStorage(): Storage | null {
    return typeof window !== 'undefined' ? window.localStorage : null;
}

/**
 * A store of list views in the browser's `localStorage` (or another `Storage`). Storage that is
 * blocked (private windows, site data settings) or full only means views aren't remembered.
 */
export function createStorageViewStore(
    storage: () => Storage | null = defaultStorage,
): ListViewStore {
    return {
        get(key) {
            try {
                const stored = storage()?.getItem(`${PREFIX}${key}`) ?? null;
                return stored !== null ? parseView(JSON.parse(stored)) : null;
            } catch {
                return null;
            }
        },
        set(key, view) {
            try {
                if (view === null) {
                    storage()?.removeItem(`${PREFIX}${key}`);
                } else {
                    storage()?.setItem(`${PREFIX}${key}`, JSON.stringify(view));
                }
            } catch {
                // The view then lasts until the page is reloaded.
            }
        },
    };
}
