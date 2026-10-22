import {
    type DataTag,
    type QueryKey,
    type UseQueryOptions,
    keepPreviousData,
    queryOptions,
} from '@tanstack/react-query';

import type {
    Definition,
    Item,
    ListQuery,
    ListResponse,
    PreviewResponse,
    SearchResponse,
} from '@panneau/protocol';

import type { DataAdapter, Values } from '../adapter';
import { type SearchKeyOptions, queryKeys } from './keys';

/**
 * Query options made by the `*QueryOptions()` functions. Their key is tagged with the type of the
 * data, so `queryClient.getQueryData(options.queryKey)` is typed.
 */
export type DataQueryOptions<TData, TKey extends QueryKey> = UseQueryOptions<
    TData,
    Error,
    TData,
    TKey
> & { queryKey: DataTag<TKey, TData, Error> };

/** Query options of the definition, for `useQuery()`, prefetching or route loaders. */
export function definitionQueryOptions(
    adapter: DataAdapter,
): DataQueryOptions<Definition, ReturnType<typeof queryKeys.definition>> {
    return queryOptions({
        queryKey: queryKeys.definition(),
        queryFn: ({ signal }) => adapter.getDefinition({ signal }),
        // The definition only changes with the user or the deployment.
        staleTime: Infinity,
    });
}

/** Query options of a page of items. The previous page stays shown while the next one loads. */
export function resourceListQueryOptions(
    adapter: DataAdapter,
    resource: string,
    query: ListQuery = {},
): DataQueryOptions<ListResponse, ReturnType<typeof queryKeys.list>> {
    return queryOptions({
        queryKey: queryKeys.list(resource, query),
        queryFn: ({ signal }) => adapter.list(resource, query, { signal }),
        placeholderData: keepPreviousData,
    });
}

/** Query options of one item. */
export function resourceItemQueryOptions(
    adapter: DataAdapter,
    resource: string,
    id: string,
): DataQueryOptions<Item, ReturnType<typeof queryKeys.item>> {
    return queryOptions({
        queryKey: queryKeys.item(resource, id),
        queryFn: ({ signal }) => adapter.get(resource, id, { signal }),
    });
}

/**
 * Query options of the iframe preview of an item: a short-lived URL of its page on the site,
 * rendered with `values` (`{}` for the saved item). The previous URL stays while the next one
 * loads, so the iframe doesn't blink. Fails when the adapter has no `previewItem()`.
 */
export function itemPreviewQueryOptions(
    adapter: DataAdapter,
    resource: string,
    id: string,
    values: Values = {},
): DataQueryOptions<PreviewResponse, ReturnType<typeof queryKeys.itemPreview>> {
    return queryOptions({
        queryKey: queryKeys.itemPreview(resource, id, values),
        queryFn: ({ signal }) => {
            if (adapter.previewItem === undefined) {
                throw new Error('The data adapter has no previewItem().');
            }
            return adapter.previewItem(resource, id, values, { signal });
        },
        placeholderData: keepPreviousData,
        // Preview URLs are signed for a short time: a new one when the panel opens again later.
        staleTime: 60_000,
    });
}

/**
 * Query options of the global search (decision 0029): every searchable resource, or those of
 * `resources`, `limit` items each. The previous results stay while the next ones load. Debounce
 * `q`, and only enable the query from 2 characters.
 */
export function searchQueryOptions(
    adapter: DataAdapter,
    q: string,
    { limit, resources }: SearchKeyOptions = {},
): DataQueryOptions<SearchResponse, ReturnType<typeof queryKeys.search>> {
    const options: SearchKeyOptions = {
        ...(limit !== undefined && { limit }),
        ...(resources !== undefined && { resources }),
    };
    return queryOptions({
        queryKey: queryKeys.search(q, options),
        queryFn: ({ signal }) => adapter.search(q, { ...options, signal }),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });
}
