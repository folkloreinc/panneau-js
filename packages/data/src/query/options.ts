import {
    type DataTag,
    type QueryKey,
    type UseQueryOptions,
    keepPreviousData,
    queryOptions,
} from '@tanstack/react-query';

import type { Definition, Item, ListQuery, ListResponse } from '@panneau/protocol';

import type { DataAdapter } from '../adapter';
import { queryKeys } from './keys';

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
