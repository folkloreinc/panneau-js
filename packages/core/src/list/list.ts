import type { FilterValue, ListQuery, Selection } from '@panneau/protocol';
import { fromSearchParams, isFilterRange, toSearchParams } from '@panneau/protocol/runtime';

import type { ResolvedList } from '../definition/list';
import { isEqual } from '../values';
import type { Router } from './router';

/**
 * Selected items: some ids, or every item matching the list query (filters and search) except
 * some ids. "All matching" covers the items of every page.
 */
export type ListSelection =
    { mode: 'ids'; ids: readonly string[] } | { mode: 'all'; except: readonly string[] };

export interface ListState {
    /** The query to fetch: the list's defaults, overridden by the current state. */
    query: ListQuery;
    selection: ListSelection;
}

export interface ListDefaults {
    perPage?: number;
    /** Default sort, as `sort` query values (`['-published_at']`). */
    sort?: string[];
}

export interface ListOptions {
    /** A resolved list, for the defaults (`perPage`, `defaultSort`). */
    list?: ResolvedList;
    /** Defaults, over those of `list`. Default values are not written to the URL. */
    defaults?: ListDefaults;
    /** The starting query, when there is no router. */
    query?: ListQuery;
    /** Keeps the query in the URL. The router's query string wins over `query`. */
    router?: Router | null;
}

/** A headless list: query and selection. React components use `useList()`. */
export interface List {
    getState(): ListState;
    subscribe(listener: () => void): () => void;
    setPage(page: number): void;
    /**
     * In a list paged with cursors: goes to the page of `nextCursor`, and remembers the cursor of
     * the page it leaves, for `previousPage()`.
     */
    nextPage(cursor: string): void;
    /**
     * In a list paged with cursors: goes back a page, to `previousCursor` when the backend gives
     * one (`null` for the first page), or else to the page it came from. Without either, it goes
     * to the first page.
     */
    previousPage(cursor?: string | null): void;
    /** Sets the page size, and goes back to the first page. */
    setPerPage(perPage: number): void;
    /** Sets the sort (`['-published_at', 'title']`), and goes back to the first page. */
    setSort(sort: readonly string[]): void;
    /** Sorts by a field: ascending, then descending, then back to the default sort. */
    toggleSort(field: string): void;
    /** Sets or removes (`undefined`) a filter, goes back to the first page, and clears the selection. */
    setFilter(id: string, value: FilterValue | undefined): void;
    /** Sets the search, goes back to the first page, and clears the selection. */
    setSearch(q: string): void;
    /** Removes the page, filters, search and sort: back to the defaults. */
    resetQuery(): void;
    /** Adds ids to the selection (removes them from the exceptions in "all matching" mode). */
    select(ids: readonly string[]): void;
    /** Removes ids from the selection (adds them to the exceptions in "all matching" mode). */
    deselect(ids: readonly string[]): void;
    toggle(id: string): void;
    /** Selects every item matching the query, on every page. */
    selectAllMatching(): void;
    clearSelection(): void;
    isSelected(id: string): boolean;
    /** How many items are selected, given the total of the list. */
    getSelectedCount(total: number): number;
    /** The selection to send with an action, or `null` when nothing is selected. */
    getSelection(): Selection | null;
}

const EMPTY_SELECTION: ListSelection = { mode: 'ids', ids: [] };
/** Back to the first page: page 1, or no cursor. */
const FIRST_PAGE = { page: 1, cursor: undefined };
const LIST_PARAM = /^(page|perPage|cursor|sort|q|fields|filter\[.+)$/;

/** Removes the values that are the defaults, so the URL only keeps what the user changed. */
function normalize(query: ListQuery, defaults: Required<ListDefaults>): ListQuery {
    const result: ListQuery = {};
    if (query.page !== undefined && query.page > 1) {
        result.page = query.page;
    }
    if (query.perPage !== undefined && query.perPage !== defaults.perPage) {
        result.perPage = query.perPage;
    }
    if (query.cursor !== undefined && query.cursor !== '') {
        result.cursor = query.cursor;
    }
    if (query.sort !== undefined && !isEqual(query.sort, defaults.sort)) {
        result.sort = [...query.sort];
    }
    const filter = Object.fromEntries(
        Object.entries(query.filter ?? {}).filter(
            ([, value]) =>
                value !== '' &&
                !(Array.isArray(value) && value.length === 0) &&
                !(isFilterRange(value) && Object.keys(value).length === 0),
        ),
    );
    if (Object.keys(filter).length > 0) {
        result.filter = filter;
    }
    if (query.q !== undefined && query.q !== '') {
        result.q = query.q;
    }
    if (query.fields !== undefined) {
        result.fields = query.fields;
    }
    return result;
}

/** Creates a headless list. */
export function createList(options: ListOptions = {}): List {
    const defaults: Required<ListDefaults> = {
        perPage: options.defaults?.perPage ?? options.list?.perPage ?? 20,
        sort: options.defaults?.sort ?? options.list?.defaultSort ?? [],
    };
    const router = options.router ?? null;
    const readRouter = (): ListQuery =>
        router !== null
            ? normalize(fromSearchParams(new URLSearchParams(router.getSearch())), defaults)
            : {};

    let params: ListQuery =
        router !== null ? readRouter() : normalize(options.query ?? {}, defaults);
    let selection: ListSelection = EMPTY_SELECTION;
    // The cursors of the pages before this one, as `nextPage()` followed them.
    let trail: (string | null)[] = [];

    // A list paged with cursors has no page numbers: its query has a cursor, after the first page.
    const cursors = options.list?.pagination === 'cursor';
    const compute = (): ListState => ({
        query: {
            ...params,
            ...(cursors ? {} : { page: params.page ?? 1 }),
            perPage: params.perPage ?? defaults.perPage,
            ...(params.sort !== undefined || defaults.sort.length > 0
                ? { sort: params.sort ?? defaults.sort }
                : {}),
        },
        selection,
    });

    let state = compute();
    const listeners = new Set<() => void>();
    const notify = () => {
        state = compute();
        listeners.forEach((listener) => listener());
    };

    const writeRouter = (replace: boolean) => {
        if (router === null) {
            return;
        }
        const search = new URLSearchParams(router.getSearch());
        [...search.keys()]
            .filter((key) => LIST_PARAM.test(key))
            .forEach((key) => search.delete(key));
        toSearchParams(params).forEach((value, key) => search.append(key, value));
        const next = search.toString();
        if (next !== router.getSearch()) {
            router.setSearch(next, { replace });
        }
    };

    const setParams = (next: ListQuery, { replace = false } = {}) => {
        const normalized = normalize(next, defaults);
        if (isEqual(normalized, params)) {
            return;
        }
        const scopeChanged =
            !isEqual(normalized.filter, params.filter) || normalized.q !== params.q;
        // Another query starts its pages over.
        const { cursor: _next, ...nextQuery } = normalized;
        const { cursor: _current, ...currentQuery } = params;
        if (!isEqual(nextQuery, currentQuery)) {
            trail = [];
        }
        params = normalized;
        if (scopeChanged) {
            selection = EMPTY_SELECTION;
        }
        writeRouter(replace);
        notify();
    };

    const setSelection = (next: ListSelection) => {
        selection = next;
        notify();
    };

    let unsubscribeRouter: (() => void) | null = null;
    const onRouterChange = () => {
        const next = readRouter();
        if (isEqual(next, params)) {
            return;
        }
        if (!isEqual(next.filter, params.filter) || next.q !== params.q) {
            selection = EMPTY_SELECTION;
        }
        params = next;
        notify();
    };

    const list: List = {
        getState() {
            if (router !== null && unsubscribeRouter === null) {
                onRouterChange();
            }
            return state;
        },
        subscribe(listener) {
            listeners.add(listener);
            if (router !== null && unsubscribeRouter === null) {
                unsubscribeRouter = router.subscribe(onRouterChange);
                onRouterChange();
            }
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0 && unsubscribeRouter !== null) {
                    unsubscribeRouter();
                    unsubscribeRouter = null;
                }
            };
        },
        setPage: (page) => setParams({ ...params, page }),
        nextPage(cursor) {
            const current = params.cursor ?? null;
            setParams({ ...params, cursor });
            trail = [...trail, current];
        },
        previousPage(cursor) {
            const back = cursor !== undefined ? cursor : (trail.at(-1) ?? null);
            const rest = trail.slice(0, -1);
            setParams({ ...params, cursor: back ?? undefined });
            trail = rest;
        },
        setPerPage: (perPage) => setParams({ ...params, perPage, ...FIRST_PAGE }),
        setSort: (sort) => setParams({ ...params, sort: [...sort], ...FIRST_PAGE }),
        toggleSort(field) {
            const sort = state.query.sort ?? [];
            if (sort[0] === field) {
                setParams({ ...params, sort: [`-${field}`], ...FIRST_PAGE });
            } else if (sort[0] === `-${field}` && params.sort !== undefined) {
                const { sort: _sort, ...rest } = params;
                setParams({ ...rest, ...FIRST_PAGE });
            } else {
                setParams({ ...params, sort: [field], ...FIRST_PAGE });
            }
        },
        setFilter(id, value) {
            const { [id]: _removed, ...filter } = params.filter ?? {};
            setParams({
                ...params,
                filter: value === undefined ? filter : { ...filter, [id]: value },
                ...FIRST_PAGE,
            });
        },
        setSearch: (q) => setParams({ ...params, q, ...FIRST_PAGE }, { replace: true }),
        resetQuery: () => setParams({}),
        select(ids) {
            if (selection.mode === 'all') {
                setSelection({
                    mode: 'all',
                    except: selection.except.filter((id) => !ids.includes(id)),
                });
            } else {
                setSelection({ mode: 'ids', ids: [...new Set([...selection.ids, ...ids])] });
            }
        },
        deselect(ids) {
            if (selection.mode === 'all') {
                setSelection({ mode: 'all', except: [...new Set([...selection.except, ...ids])] });
            } else {
                setSelection({ mode: 'ids', ids: selection.ids.filter((id) => !ids.includes(id)) });
            }
        },
        toggle(id) {
            if (list.isSelected(id)) {
                list.deselect([id]);
            } else {
                list.select([id]);
            }
        },
        selectAllMatching: () => setSelection({ mode: 'all', except: [] }),
        clearSelection: () => setSelection(EMPTY_SELECTION),
        isSelected: (id) =>
            selection.mode === 'all' ? !selection.except.includes(id) : selection.ids.includes(id),
        getSelectedCount: (total) =>
            selection.mode === 'all'
                ? Math.max(0, total - selection.except.length)
                : selection.ids.length,
        getSelection() {
            if (selection.mode === 'ids') {
                return selection.ids.length > 0 ? { ids: [...selection.ids] } : null;
            }
            const query: { filter?: Record<string, unknown>; q?: string } = {};
            if (params.filter !== undefined) {
                query.filter = params.filter;
            }
            if (params.q !== undefined) {
                query.q = params.q;
            }
            return selection.except.length > 0
                ? { query, except: [...selection.except] }
                : { query };
        },
    };
    return list;
}
