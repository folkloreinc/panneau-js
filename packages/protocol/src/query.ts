export type FilterValue = string | number | boolean | Array<string | number | boolean>;

/** Query of a list request (`GET /resources/{resource}`). */
export interface ListQuery {
    page?: number;
    perPage?: number;
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
    if (query.sort !== undefined && query.sort.length > 0) {
        params.set('sort', query.sort.join(','));
    }
    Object.entries(query.filter ?? {}).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => params.append(`filter[${key}][]`, String(item)));
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

const FILTER_KEY = /^filter\[([^\]]+)\](\[\])?$/;

/** Parses a list query from the protocol's query string format. Filter values stay strings. */
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
        if (match[2] !== undefined) {
            const current = query.filter[name];
            query.filter[name] = [...(Array.isArray(current) ? current : []), value];
        } else {
            query.filter[name] = value;
        }
    });
    return query;
}
