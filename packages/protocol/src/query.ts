/**
 * The bounds of a range filter (`date-range`), both inclusive. An open end is left out. Sent as
 * `filter[published_at][from]=2026-01-01&filter[published_at][to]=2026-01-31`.
 */
export interface FilterRange {
    from?: string | number;
    to?: string | number;
}

/**
 * The value of a filter: one value (`filter[status]=draft`), a list that matches any of its values
 * (`filter[tags][]=a&filter[tags][]=b`), or the bounds of a range.
 */
export type FilterValue =
    string | number | boolean | Array<string | number | boolean> | FilterRange;

/** Whether a filter value is the bounds of a range, and not one value or a list of values. */
export function isFilterRange(value: unknown): value is FilterRange {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const RANGE_BOUNDS = ['from', 'to'] as const;

/**
 * Whether a value is within the bounds of a range filter, both inclusive: the reference of how a
 * backend reads them. Numbers compare as numbers. Other values compare as strings, on the length of
 * the bound, so that a day (`2026-01-31`) includes the times of that day (`2026-01-31T18:00:00Z`).
 * An empty value is never in a range.
 */
export function matchesFilterRange(value: unknown, range: FilterRange): boolean {
    if (value === null || value === undefined || value === '') {
        return false;
    }
    const compare = (bound: string | number): number => {
        if (typeof value === 'number' || typeof bound === 'number') {
            return Number(value) - Number(bound);
        }
        const prefix = String(value).slice(0, bound.length);
        return prefix < bound ? -1 : prefix > bound ? 1 : 0;
    };
    return (
        (range.from === undefined || range.from === '' || compare(range.from) >= 0) &&
        (range.to === undefined || range.to === '' || compare(range.to) <= 0)
    );
}

/** Query of a list request (`GET /resources/{resource}`). */
export interface ListQuery {
    page?: number;
    perPage?: number;
    /** The page to get of a list whose `pagination` is `cursor`: `nextCursor` of the page before. */
    cursor?: string;
    /** Fields to sort by, in order. A `-` prefix sorts descending. */
    sort?: string[];
    filter?: Record<string, FilterValue>;
    q?: string;
    /** Fields to include in each item. */
    fields?: string[];
}

/** Serializes a list query to the protocol's query string format. */
export function toSearchParams(query: ListQuery): URLSearchParams {
    const params = new URLSearchParams();
    if (query.page !== undefined) {
        params.set('page', String(query.page));
    }
    if (query.perPage !== undefined) {
        params.set('perPage', String(query.perPage));
    }
    if (query.cursor !== undefined && query.cursor !== '') {
        params.set('cursor', query.cursor);
    }
    if (query.sort !== undefined && query.sort.length > 0) {
        params.set('sort', query.sort.join(','));
    }
    Object.entries(query.filter ?? {}).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => params.append(`filter[${key}][]`, String(item)));
        } else if (isFilterRange(value)) {
            RANGE_BOUNDS.forEach((bound) => {
                const limit = value[bound];
                if (limit !== undefined && limit !== '') {
                    params.set(`filter[${key}][${bound}]`, String(limit));
                }
            });
        } else {
            params.set(`filter[${key}]`, String(value));
        }
    });
    if (query.q !== undefined && query.q !== '') {
        params.set('q', query.q);
    }
    if (query.fields !== undefined && query.fields.length > 0) {
        params.set('fields', query.fields.join(','));
    }
    return params;
}

const FILTER_KEY = /^filter\[([^\]]+)\](?:\[(|from|to)\])?$/;

/**
 * Parses a list query from the protocol's query string format. Filter values stay strings, and the
 * bounds of a range (`filter[id][from]`, `filter[id][to]`) become a `FilterRange`.
 */
export function fromSearchParams(params: URLSearchParams): ListQuery {
    const query: ListQuery = {};
    const integer = (value: string | null): number | undefined => {
        if (value === null || !/^\d+$/.test(value)) {
            return undefined;
        }
        return Number.parseInt(value, 10);
    };
    const page = integer(params.get('page'));
    if (page !== undefined) {
        query.page = page;
    }
    const perPage = integer(params.get('perPage'));
    if (perPage !== undefined) {
        query.perPage = perPage;
    }
    const cursor = params.get('cursor');
    if (cursor !== null && cursor !== '') {
        query.cursor = cursor;
    }
    const sort = params.get('sort');
    if (sort !== null && sort !== '') {
        query.sort = sort.split(',').filter((part) => part !== '');
    }
    const q = params.get('q');
    if (q !== null && q !== '') {
        query.q = q;
    }
    const fields = params.get('fields');
    if (fields !== null && fields !== '') {
        query.fields = fields.split(',').filter((part) => part !== '');
    }
    params.forEach((value, key) => {
        const match = FILTER_KEY.exec(key);
        if (match?.[1] === undefined) {
            return;
        }
        query.filter ??= {};
        const name = match[1];
        const current = query.filter[name];
        if (match[2] === '') {
            query.filter[name] = [...(Array.isArray(current) ? current : []), value];
        } else if (match[2] !== undefined) {
            if (value !== '') {
                query.filter[name] = {
                    ...(isFilterRange(current) ? current : {}),
                    [match[2]]: value,
                };
            }
        } else {
            query.filter[name] = value;
        }
    });
    return query;
}

/** The meta of a page of a list paged with cursors (`pagination: "cursor"`). */
export interface CursorPageMeta {
    perPage: number;
    nextCursor: string | null;
    previousCursor?: string | null;
    total?: number | null;
}

/**
 * Whether the meta of a page of a list comes from a list paged with cursors (`nextCursor`), rather
 * than numbered pages (`page`, `lastPage`, `total`).
 */
export function isCursorPage(meta: object): meta is CursorPageMeta {
    return 'nextCursor' in meta;
}
