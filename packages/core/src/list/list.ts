import type { FilterValue, ListQuery, Selection } from '@panneau/protocol';
import { fromSearchParams, isFilterRange, toSearchParams } from '@panneau/protocol/runtime';

import type { ResolvedCalendar, ResolvedList } from '../definition/list';
import { isEqual } from '../values';
import { currentMonth, getCalendarRange, isMonth } from './calendar';
import type { Router } from './router';
import {
    type ListViewState,
    type ListViewStore,
    type RememberedView,
    createStorageViewStore,
} from './viewStore';

/**
 * Selected items: some ids, or every item matching the list query (filters and search) except
 * some ids. "All matching" covers the items of every page.
 */
export type ListSelection =
    { mode: 'ids'; ids: readonly string[] } | { mode: 'all'; except: readonly string[] };

export interface ListState {
    /** The query to fetch: the list's defaults, overridden by the current state. */
    query: ListQuery;
    /** How the items are shown: the layout and the columns, when they aren't the defaults. */
    view: ListViewState;
    selection: ListSelection;
}

export interface ListDefaults {
    perPage?: number;
    /** Default sort, as `sort` query values (`['-published_at']`). */
    sort?: string[];
    /** The default layout. */
    layout?: string;
    /** The ids of the columns shown by default, in their order. */
    columns?: string[];
    /** The calendar of the list, for its `calendar` layout (decision 0044). */
    calendar?: ResolvedCalendar | null;
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
    /**
     * Remembers the view of the list (filters, sort, page size, layout and columns) under `key`,
     * in `store` (the browser's `localStorage` by default), and restores it when the list opens
     * without a query of its own: a URL without any parameter of the list (decision 0042).
     */
    remember?: { key: string; store?: ListViewStore } | null;
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
    /** Removes the page, filters, search and sort: back to the defaults. The view stays. */
    resetQuery(): void;
    /** Shows the items in a layout (`cards`). */
    setLayout(layout: string): void;
    /** Shows these columns, by id, in this order. */
    setColumns(ids: readonly string[]): void;
    /** Back to the columns of the definition. */
    resetColumns(): void;
    /** Shows a month in the calendar (`2026-11`). */
    setMonth(month: string): void;
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
const LIST_PARAM = /^(page|perPage|cursor|sort|q|fields|layout|columns|month|filter\[.+)$/;

type Defaults = Required<Pick<ListDefaults, 'perPage' | 'sort'>> &
    Pick<ListDefaults, 'layout' | 'columns'> & { calendar: ResolvedCalendar | null };

/** Removes the values that are the defaults, so the URL only keeps what the user changed. */
function normalize(query: ListQuery, defaults: Defaults): ListQuery {
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

/** Removes the parts of the view that are the defaults. */
function normalizeView(view: ListViewState, defaults: Defaults): ListViewState {
    const result: ListViewState = {};
    if (view.layout !== undefined && view.layout !== '' && view.layout !== defaults.layout) {
        result.layout = view.layout;
    }
    if (
        view.columns !== undefined &&
        view.columns.length > 0 &&
        !isEqual(view.columns, defaults.columns)
    ) {
        result.columns = [...view.columns];
    }
    if (isMonth(view.month) && view.month !== currentMonth()) {
        result.month = view.month;
    }
    return result;
}

function readView(search: URLSearchParams): ListViewState {
    const view: ListViewState = {};
    const layout = search.get('layout');
    if (layout !== null) {
        view.layout = layout;
    }
    const columns = search.get('columns');
    if (columns !== null) {
        view.columns = columns.split(',').filter((id) => id !== '');
    }
    const month = search.get('month');
    if (month !== null) {
        view.month = month;
    }
    return view;
}

/** What a list remembers of its query: not its page, cursor or search. */
function rememberedQuery(query: ListQuery): RememberedView['query'] {
    const result: RememberedView['query'] = {};
    if (query.filter !== undefined) {
        result.filter = query.filter;
    }
    if (query.sort !== undefined) {
        result.sort = query.sort;
    }
    if (query.perPage !== undefined) {
        result.perPage = query.perPage;
    }
    return result;
}

/** Creates a headless list. */
export function createList(options: ListOptions = {}): List {
    const defaults: Defaults = {
        perPage: options.defaults?.perPage ?? options.list?.perPage ?? 20,
        sort: options.defaults?.sort ?? options.list?.defaultSort ?? [],
        calendar: options.defaults?.calendar ?? options.list?.calendar ?? null,
    };
    const defaultLayout = options.defaults?.layout ?? options.list?.layouts[0];
    if (defaultLayout !== undefined) {
        defaults.layout = defaultLayout;
    }
    const defaultColumns =
        options.defaults?.columns ??
        options.list?.columns.filter((column) => !column.hidden).map((column) => column.id);
    if (defaultColumns !== undefined) {
        defaults.columns = defaultColumns;
    }
    const router = options.router ?? null;
    const readRouter = (): { query: ListQuery; view: ListViewState } => {
        if (router === null) {
            return { query: {}, view: {} };
        }
        const search = new URLSearchParams(router.getSearch());
        return {
            query: normalize(fromSearchParams(search), defaults),
            view: normalizeView(readView(search), defaults),
        };
    };
    const hasListParams = (): boolean =>
        router !== null &&
        [...new URLSearchParams(router.getSearch()).keys()].some((key) => LIST_PARAM.test(key));

    const remember = options.remember ?? null;
    const store = remember !== null ? (remember.store ?? createStorageViewStore()) : null;
    // A list that opens without a query of its own shows the view it remembers.
    const remembered =
        remember !== null &&
        store !== null &&
        (router !== null ? !hasListParams() : options.query === undefined)
            ? store.get(remember.key)
            : null;

    const initial = router !== null ? readRouter() : null;
    let params: ListQuery = normalize(
        remembered?.query ?? initial?.query ?? options.query ?? {},
        defaults,
    );
    let view: ListViewState = normalizeView(remembered?.view ?? initial?.view ?? {}, defaults);
    // The remembered view is written to the URL once the list is subscribed to: not while it
    // renders.
    let restoring = remembered !== null && router !== null;
    let selection: ListSelection = EMPTY_SELECTION;
    // The cursors of the pages before this one, as `nextPage()` followed them.
    let trail: (string | null)[] = [];

    // A list paged with cursors has no page numbers: its query has a cursor, after the first page.
    const cursors = options.list?.pagination === 'cursor';
    const sortQuery = (): Pick<ListQuery, 'sort'> =>
        params.sort !== undefined || defaults.sort.length > 0
            ? { sort: params.sort ?? defaults.sort }
            : {};
    // In the calendar, a month: the days around it through its filter, instead of a page.
    const calendarQuery = (calendar: ResolvedCalendar): ListQuery => {
        const { page: _page, cursor: _cursor, perPage: _perPage, ...rest } = params;
        return {
            ...rest,
            ...sortQuery(),
            perPage: calendar.perPage,
            filter: {
                ...params.filter,
                [calendar.filter]: getCalendarRange(view.month ?? currentMonth()),
            },
        };
    };
    const compute = (): ListState => ({
        query:
            defaults.calendar !== null && (view.layout ?? defaults.layout) === 'calendar'
                ? calendarQuery(defaults.calendar)
                : {
                      ...params,
                      ...(cursors ? {} : { page: params.page ?? 1 }),
                      perPage: params.perPage ?? defaults.perPage,
                      ...sortQuery(),
                  },
        view,
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
        if (view.layout !== undefined) {
            search.set('layout', view.layout);
        }
        if (view.columns !== undefined) {
            search.set('columns', view.columns.join(','));
        }
        if (view.month !== undefined) {
            search.set('month', view.month);
        }
        const next = search.toString();
        if (next !== router.getSearch()) {
            router.setSearch(next, { replace });
        }
    };

    // Only what the user changes is remembered: not the view of a link they opened.
    const save = () => {
        if (remember === null || store === null) {
            return;
        }
        const query = rememberedQuery(params);
        // A calendar opens on the current month.
        const { month: _month, ...remembered } = view;
        store.set(
            remember.key,
            Object.keys(query).length > 0 || Object.keys(remembered).length > 0
                ? { query, view: remembered }
                : null,
        );
    };

    const setView = (next: ListViewState, { replace = false } = {}) => {
        const normalized = normalizeView(next, defaults);
        if (isEqual(normalized, view)) {
            return;
        }
        view = normalized;
        writeRouter(replace);
        save();
        notify();
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
        save();
        notify();
    };

    const setSelection = (next: ListSelection) => {
        selection = next;
        notify();
    };

    let unsubscribeRouter: (() => void) | null = null;
    const onRouterChange = () => {
        // Until the remembered view is in the URL, the bare URL doesn't replace it.
        if (restoring && !hasListParams()) {
            return;
        }
        restoring = false;
        const { query: next, view: nextView } = readRouter();
        if (isEqual(next, params) && isEqual(nextView, view)) {
            return;
        }
        if (!isEqual(next.filter, params.filter) || next.q !== params.q) {
            selection = EMPTY_SELECTION;
        }
        params = next;
        view = nextView;
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
                if (restoring) {
                    // Replacing the entry: Back doesn't go through the bare URL.
                    restoring = false;
                    writeRouter(true);
                }
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
        setLayout: (layout) => setView({ ...view, layout }),
        setColumns: (ids) => setView({ ...view, columns: [...ids] }, { replace: true }),
        resetColumns() {
            const { columns: _columns, ...rest } = view;
            setView(rest, { replace: true });
        },
        setMonth: (month) => setView({ ...view, month }),
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
