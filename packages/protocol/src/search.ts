/** Shortest search, in characters once trimmed: shorter is a `422`. */
export const SEARCH_MIN_LENGTH = 2;
/** Longest search, in characters. */
export const SEARCH_MAX_LENGTH = 255;
/** Items per resource without a `limit`. */
export const SEARCH_DEFAULT_LIMIT = 5;
/** Highest `limit`, and most items of a response, every resource together. */
export const SEARCH_MAX_LIMIT = 20;

/** What the global search reads of a resource. */
export interface SearchableResource {
    id: string;
    features?: { search?: boolean | undefined } | undefined;
    list?: { search?: boolean | undefined } | undefined;
}

/** Query of the global search (`GET /search`). */
export interface SearchQuery {
    q: string;
    /** Items per resource, from 1 to 20. Defaults to 5. */
    limit?: number;
    /** Ids of the searchable resources to search. Defaults to every one. */
    resources?: readonly string[];
}

/**
 * Whether a resource is in the global search: its `features.search`, or, without it, whether its
 * list has a search (`list.search`), so one setting serves both (decision 0029).
 */
export function isSearchableResource(resource: Omit<SearchableResource, 'id'>): boolean {
    return resource.features?.search ?? resource.list?.search ?? false;
}

/** Serializes a search query: `q=été&limit=20&resources=pages,articles`. */
export function toSearchQueryParams(query: SearchQuery): URLSearchParams {
    const params = new URLSearchParams({ q: query.q });
    if (query.limit !== undefined) {
        params.set('limit', String(query.limit));
    }
    if (query.resources !== undefined && query.resources.length > 0) {
        params.set('resources', query.resources.join(','));
    }
    return params;
}

/** A search query as a backend reads it: valid, or the messages of its invalid parameters. */
export type ReadSearchQueryResult =
    | { query: Required<SearchQuery>; errors?: undefined }
    | { query?: undefined; errors: Record<string, string[]> };

/**
 * Reads the query string of `GET /search`: the reference of how a backend validates it. `q` is
 * trimmed and needs 2 characters; `limit` is an integer from 1 to 20; `resources` lists searchable
 * resources of the definition. Invalid parameters are a `422`, with `errors` keyed by parameter.
 * Without `resources`, every searchable resource is searched, in the order of the definition.
 */
export function readSearchQuery(
    params: URLSearchParams,
    definition: { resources: readonly SearchableResource[] },
): ReadSearchQueryResult {
    const errors: Record<string, string[]> = {};
    const q = (params.get('q') ?? '').trim();
    if (q.length < SEARCH_MIN_LENGTH) {
        errors.q = [`The search must have at least ${SEARCH_MIN_LENGTH} characters.`];
    } else if (q.length > SEARCH_MAX_LENGTH) {
        errors.q = [`The search must have at most ${SEARCH_MAX_LENGTH} characters.`];
    }

    const rawLimit = params.get('limit');
    const limit = rawLimit === null ? SEARCH_DEFAULT_LIMIT : Number(rawLimit);
    if (rawLimit !== null && (!/^\d+$/.test(rawLimit) || limit < 1 || limit > SEARCH_MAX_LIMIT)) {
        errors.limit = [`The limit must be an integer from 1 to ${SEARCH_MAX_LIMIT}.`];
    }

    const searchable = definition.resources
        .filter(isSearchableResource)
        .map((resource) => resource.id);
    const rawResources = params.get('resources');
    const asked =
        rawResources === null
            ? searchable
            : rawResources
                  .split(',')
                  .map((id) => id.trim())
                  .filter((id) => id !== '');
    const unknown = asked.filter((id) => !searchable.includes(id));
    if (rawResources !== null && (asked.length === 0 || unknown.length > 0)) {
        errors.resources = [
            unknown.length > 0
                ? `These resources are not searchable: ${unknown.join(', ')}.`
                : 'List at least one resource.',
        ];
    }

    if (Object.keys(errors).length > 0) {
        return { errors };
    }
    // The order of the definition, without duplicates
    const resources = searchable.filter((id) => asked.includes(id));
    return { query: { q, limit, resources } };
}
