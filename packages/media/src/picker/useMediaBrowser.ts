import { useEffect, useRef, useState } from 'react';

import type { FilterValue } from '@panneau/protocol';

import type { MediaQuery, MediaSource, MediaType, PickerMedia } from './types';

/** What the user chose to see in a source. */
export interface BrowseQuery {
    q: string;
    type: MediaType | null;
    sort: string | null;
    /** Values of the filters the user can change. */
    filter: Readonly<Record<string, FilterValue>>;
}

/** The pages of a source loaded for its query. */
export interface BrowseState {
    query: BrowseQuery;
    /** The media shown: the pinned ones first, then the pages loaded, without the pinned ones. */
    items: readonly PickerMedia[];
    /**
     * Ids of the media uploaded since the query last changed: shown first, whatever the sort,
     * until the next search, filter or sort.
     */
    pinned: readonly string[];
    nextCursor: string | null;
    total: number | null;
    /** `idle` until the first page is asked for; `more` while the next page loads. */
    status: 'idle' | 'loading' | 'ready' | 'more' | 'error';
}

/**
 * The items of a state with a page added: the first page replaces the pages loaded, the next ones
 * follow them. Pinned media stay first, and a media is shown once.
 */
function withPage(
    current: BrowseState,
    page: readonly PickerMedia[],
    first: boolean,
): readonly PickerMedia[] {
    const pinned = new Set(current.pinned);
    const kept = first ? current.items.filter((item) => pinned.has(item.id)) : current.items;
    const shown = new Set(kept.map((item) => item.id));
    return [...kept, ...page.filter((item) => !shown.has(item.id))];
}

const EMPTY_QUERY: BrowseQuery = { q: '', type: null, sort: null, filter: {} };

/** The states and scroll positions kept between openings, by `stateKey`, then by source. */
const kept = new Map<
    string,
    { states: ReadonlyMap<string, BrowseState>; scroll: ReadonlyMap<string, number> }
>();

function initialState(query: BrowseQuery): BrowseState {
    return { query, items: [], pinned: [], nextCursor: null, total: null, status: 'idle' };
}

function isEmpty(value: FilterValue | undefined): boolean {
    return (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
    );
}

/** The query a source gets: the user's, then the opener's locked filters over it. */
export function toMediaQuery(
    query: BrowseQuery,
    locked: Readonly<Record<string, FilterValue>>,
    cursor: string | null,
): MediaQuery {
    const filter: Record<string, FilterValue> = {};
    for (const [id, value] of Object.entries(query.filter)) {
        if (!isEmpty(value)) {
            filter[id] = value;
        }
    }
    if (query.type !== null) {
        filter.type = query.type;
    }
    Object.assign(filter, locked);
    return {
        ...(query.q !== '' ? { q: query.q } : {}),
        ...(Object.keys(filter).length > 0 ? { filter } : {}),
        ...(query.sort !== null ? { sort: query.sort } : {}),
        ...(cursor !== null ? { cursor } : {}),
    };
}

export interface UseMediaBrowserOptions {
    sources: readonly MediaSource[];
    /** The source shown. */
    source: MediaSource | null;
    /** The opener's filters, applied to every query. */
    locked: Readonly<Record<string, FilterValue>>;
    /** The sort a source starts with, when the opener chose none. */
    defaultSort: (source: MediaSource) => string | null;
    /** The type a source starts filtered on. */
    defaultType?: MediaType | null;
    stateKey: string | undefined;
}

export interface MediaBrowser {
    state: BrowseState;
    setQuery: (query: BrowseQuery) => void;
    loadMore: () => void;
    retry: () => void;
    /** Updates media of a source in place. */
    upsert: (sourceId: string, media: readonly PickerMedia[]) => void;
    /**
     * Adds media just uploaded to a source, first, and keeps them first until its query changes,
     * whatever its sort.
     */
    pin: (sourceId: string, media: readonly PickerMedia[]) => void;
    /** Where the user scrolled to in the source shown, to come back to it. */
    scrollTop: () => number;
    rememberScroll: (scrollTop: number) => void;
}

/**
 * The pages of the source shown, for the user's query and the opener's locked filters: the first
 * page when the query changes, the next one on `loadMore()`. Each source keeps its query, its
 * pages and its scroll position while the picker is open, and across openings with a
 * `stateKey`, so the user comes back where they left it.
 */
export function useMediaBrowser({
    sources,
    source,
    locked,
    defaultSort,
    defaultType = null,
    stateKey,
}: UseMediaBrowserOptions): MediaBrowser {
    const restored = stateKey !== undefined ? kept.get(stateKey) : undefined;
    const [states, setStates] = useState<ReadonlyMap<string, BrowseState>>(
        () => restored?.states ?? new Map(),
    );
    // Scroll positions change too often to render: a ref, kept with the states.
    const scroll = useRef<Map<string, number> | null>(null);
    if (scroll.current === null) {
        scroll.current = new Map(restored?.scroll ?? []);
    }
    useEffect(() => {
        if (stateKey !== undefined && scroll.current !== null) {
            kept.set(stateKey, { states, scroll: scroll.current });
        }
    });

    const id = source?.id ?? '';
    const stateOf = (candidate: MediaSource): BrowseState =>
        states.get(candidate.id) ??
        initialState({ ...EMPTY_QUERY, type: defaultType, sort: defaultSort(candidate) });
    const state = source !== null ? stateOf(source) : initialState(EMPTY_QUERY);

    const update = (sourceId: string, change: (current: BrowseState) => BrowseState) =>
        setStates((current) => {
            const candidate = sources.find((entry) => entry.id === sourceId);
            const previous =
                current.get(sourceId) ??
                initialState({
                    ...EMPTY_QUERY,
                    type: defaultType,
                    sort: candidate !== undefined ? defaultSort(candidate) : null,
                });
            return new Map(current).set(sourceId, change(previous));
        });

    // Requests stop when the picker closes. A change of query doesn't stop them: their answer is
    // dropped instead, since it no longer matches the query of the source.
    const requests = useRef(new Set<AbortController>());
    useEffect(() => {
        const pending = requests.current;
        return () => pending.forEach((controller) => controller.abort());
    }, []);

    // Loads a page of a source, and drops it when the query changed since.
    const load = (target: MediaSource, query: BrowseQuery, cursor: string | null) => {
        const controller = new AbortController();
        requests.current.add(controller);
        target
            .list(toMediaQuery(query, locked, cursor), { signal: controller.signal })
            .then((page) =>
                update(target.id, (current) =>
                    current.query !== query
                        ? current
                        : {
                              ...current,
                              items: withPage(current, page.items, cursor === null),
                              nextCursor: page.nextCursor,
                              total: page.total ?? null,
                              status: 'ready',
                          },
                ),
            )
            .catch(() => {
                if (!controller.signal.aborted) {
                    update(target.id, (current) =>
                        current.query !== query ? current : { ...current, status: 'error' },
                    );
                }
            })
            .finally(() => requests.current.delete(controller));
    };

    // The first page of the source shown, once per query: its status is `idle` after a change.
    const start = useRef<() => void>(() => undefined);
    useEffect(() => {
        start.current = () => {
            if (source === null || state.status !== 'idle') {
                return;
            }
            const { query } = state;
            // The same query object, which the answer is checked against.
            update(source.id, (current) => ({ ...current, query, status: 'loading' }));
            load(source, query, null);
        };
    });
    const status = state.status;
    useEffect(() => {
        start.current();
    }, [id, status]);

    return {
        state,
        setQuery: (query) => update(id, () => ({ ...initialState(query) })),
        loadMore: () => {
            if (source === null || state.status !== 'ready' || state.nextCursor === null) {
                return;
            }
            const { query, nextCursor } = state;
            update(id, (current) => ({ ...current, status: 'more' }));
            load(source, query, nextCursor);
        },
        retry: () =>
            update(id, (current) =>
                // Media pinned before the first page came are not a page: it is asked again.
                current.items.length > current.pinned.length
                    ? { ...current, status: 'ready' }
                    : { ...current, status: 'idle' },
            ),
        upsert: (sourceId, media) =>
            update(sourceId, (current) => {
                const byId = new Map(media.map((entry) => [entry.id, entry]));
                return {
                    ...current,
                    items: current.items.map((entry) => byId.get(entry.id) ?? entry),
                };
            }),
        pin: (sourceId, media) =>
            update(sourceId, (current) => {
                const ids = new Set(media.map((entry) => entry.id));
                const known = new Set(current.items.map((entry) => entry.id));
                const added = media.filter((entry) => !known.has(entry.id)).length;
                return {
                    ...current,
                    items: [...media, ...current.items.filter((entry) => !ids.has(entry.id))],
                    pinned: [
                        ...media.map((entry) => entry.id),
                        ...current.pinned.filter((id) => !ids.has(id)),
                    ],
                    total: current.total === null ? null : current.total + added,
                };
            }),
        scrollTop: () => scroll.current?.get(id) ?? 0,
        rememberScroll: (scrollTop) => {
            scroll.current?.set(id, scrollTop);
        },
    };
}
