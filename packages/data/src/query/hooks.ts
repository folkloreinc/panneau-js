import {
    type UseMutationResult,
    type UseQueryOptions,
    type UseQueryResult,
    skipToken,
    useMutation,
    useQueries,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import type {
    ActionRequest,
    ActionRun,
    AggregateRequest,
    Definition,
    Item,
    ListQuery,
    ListResponse,
    PreviewResponse,
    SearchResponse,
} from '@panneau/protocol';

import type { ActionResponse, Values } from '../adapter';
import { ConflictError } from '../errors';
import { useDataAdapter } from './context';
import { type SearchKeyOptions, type WidgetKeyOptions, queryKeys } from './keys';
import { type PendingEdit, endEdit, sendInTurn, startEdit } from './optimistic';
import {
    definitionQueryOptions,
    itemPreviewQueryOptions,
    resourceAggregateQueryOptions,
    resourceItemQueryOptions,
    resourceListQueryOptions,
    searchQueryOptions,
    widgetDataQueryOptions,
} from './options';
import { invalidateActionResult, invalidateLists } from './refresh';

/** Options of a query hook: TanStack Query's options, without the key and the function. */
export type QueryHookOptions<TData, TKey extends readonly unknown[]> = Omit<
    UseQueryOptions<TData, Error, TData, TKey>,
    'queryKey' | 'queryFn'
>;

/**
 * The definition for the current user. Pass `initialData` when the server inlines it in the page.
 */
export function useDefinition(
    options: QueryHookOptions<Definition, ReturnType<typeof queryKeys.definition>> = {},
): UseQueryResult<Definition> {
    const adapter = useDataAdapter();
    return useQuery({ ...definitionQueryOptions(adapter), ...options });
}

/** A page of items of a resource. */
export function useResourceList(
    resource: string,
    query: ListQuery = {},
    options: QueryHookOptions<ListResponse, ReturnType<typeof queryKeys.list>> = {},
): UseQueryResult<ListResponse> {
    const adapter = useDataAdapter();
    return useQuery({ ...resourceListQueryOptions(adapter, resource, query), ...options });
}

/** One item of a resource. Nothing is fetched while `id` is `null` or `undefined`. */
export function useResourceItem(
    resource: string,
    id: string | null | undefined,
    options: QueryHookOptions<Item, ReturnType<typeof queryKeys.item>> = {},
): UseQueryResult<Item> {
    const adapter = useDataAdapter();
    const query = resourceItemQueryOptions(adapter, resource, id ?? '');
    return useQuery({ ...query, queryFn: id == null ? skipToken : query.queryFn, ...options });
}

/**
 * The iframe preview of an item: a short-lived URL of its page on the site, rendered with
 * `values` (`{}` for the saved item). Pass `enabled: false` until the preview is shown.
 */
export function useItemPreview(
    resource: string,
    id: string,
    values: Values = {},
    options: QueryHookOptions<PreviewResponse, ReturnType<typeof queryKeys.itemPreview>> = {},
): UseQueryResult<PreviewResponse> {
    const adapter = useDataAdapter();
    return useQuery({ ...itemPreviewQueryOptions(adapter, resource, id, values), ...options });
}

/**
 * The global search: items of every searchable resource, or of those of `resources`, grouped by
 * resource (decision 0029). Pass `enabled: false` until there is a query worth sending (2
 * characters), and debounce `q`. A `429` fails with a
 * `RateLimitedError`: don't retry it before its `retryAfter`.
 */
export function useSearch(
    q: string,
    {
        limit,
        resources,
        ...options
    }: QueryHookOptions<SearchResponse, ReturnType<typeof queryKeys.search>> &
        SearchKeyOptions = {},
): UseQueryResult<SearchResponse> {
    const adapter = useDataAdapter();
    return useQuery({ ...searchQueryOptions(adapter, q, { limit, resources }), ...options });
}

/**
 * The data of a widget of a dashboard with data of its own (decision 0064), unchecked: check it
 * with `checkWidgetData()` of `@panneau/protocol/runtime`. `page` is the dashboard page of the
 * widget (decision 0084), the home page without it; `resource` the resource whose summary holds
 * it, with `query`, the filters and the search of its list; `period` the period of its overview
 * (`period[option]`, `period[from]`, `period[to]`). Changes to the items of that resource
 * refetch the widgets of its summary. A `403` fails with a `ForbiddenError`: the widget is hidden.
 */
export function useWidgetData(
    widget: string,
    {
        page,
        resource,
        query,
        period,
        ...options
    }: QueryHookOptions<unknown, ReturnType<typeof queryKeys.widget>> & WidgetKeyOptions = {},
): UseQueryResult<unknown> {
    const adapter = useDataAdapter();
    return useQuery({
        ...widgetDataQueryOptions(adapter, widget, { page, resource, query, period }),
        ...options,
    });
}

/**
 * The aggregates of a resource (`GET /resources/{resource}/aggregate`, decision 0084): the count
 * or the sum of its list with the filters and the search of `request`, grouped by its `group`, in
 * the shape of a widget, unchecked: check it with `checkWidgetData()` of
 * `@panneau/protocol/runtime`. Changes to the items of the resource refetch it.
 */
export function useResourceAggregate(
    resource: string,
    request: AggregateRequest = {},
    options: QueryHookOptions<unknown, ReturnType<typeof queryKeys.aggregate>> = {},
): UseQueryResult<unknown> {
    const adapter = useDataAdapter();
    return useQuery({ ...resourceAggregateQueryOptions(adapter, resource, request), ...options });
}

/** A read of `useResourceAggregates()`: a resource and the request of its aggregates. */
export interface ResourceAggregateRead {
    resource: string;
    request: AggregateRequest;
}

/**
 * Several aggregates, of one resource or more (decision 0089), as `useResourceAggregate()` reads
 * each one: the results in the order of `reads`, whose length can change between renders (a read
 * that depends on another one's answer). The previous answer of each one stays while the next one
 * loads. `enabled: false` reads none.
 */
export function useResourceAggregates(
    reads: readonly ResourceAggregateRead[],
    { enabled = true }: { enabled?: boolean } = {},
): UseQueryResult<unknown>[] {
    const adapter = useDataAdapter();
    return useQueries({
        queries: reads.map(({ resource, request }) => ({
            ...resourceAggregateQueryOptions(adapter, resource, request),
            enabled,
        })),
    });
}

/** Creates an item, then refetches the lists of the resource. */
export function useCreateItem(resource: string): UseMutationResult<Item, Error, Values> {
    const adapter = useDataAdapter();
    const client = useQueryClient();
    return useMutation({
        mutationFn: (values: Values) => adapter.create(resource, values),
        onSuccess: (item) => {
            client.setQueryData(queryKeys.item(resource, item.id), item);
            return invalidateLists(client, resource);
        },
    });
}

export interface UpdateItemVariables {
    /** Id of the item. */
    id: string;
    /** The values to change, keyed by field name. */
    values: Values;
    /** The version the values were edited from, sent as `If-Match`. */
    version?: string | null;
}

export interface UpdateItemOptions {
    /**
     * Shows the values at once, before the server answers, in the cached item and in every cached
     * list of the resource that holds it, and puts them back when the save fails: for edits in
     * place (decisions 0043 and 0105). The edits of one item are sent one after the other, and an edit made
     * from a version that an earlier one replaced is sent with the version that one got back.
     * The lists are refetched once no edit of the item is pending, without waiting for them.
     */
    optimistic?: boolean;
}

/**
 * Updates an item, then caches the updated item, puts it in the cached lists of the resource that
 * show it, and refetches them. Fails with a `ConflictError` when the item changed since `version`.
 * With `optimistic`, the item shows its new values before the server answers.
 */
export function useUpdateItem(
    resource: string,
    { optimistic = false }: UpdateItemOptions = {},
): UseMutationResult<Item, Error, UpdateItemVariables> {
    const adapter = useDataAdapter();
    const client = useQueryClient();
    const showSaved = (item: Item) => {
        client.setQueryData(queryKeys.item(resource, item.id), item);
        // Lists show it at once, as an edit in place does, until they are refetched.
        client.setQueriesData<ListResponse>({ queryKey: queryKeys.lists(resource) }, (list) =>
            list?.data.some((candidate) => candidate.id === item.id) === true
                ? {
                      ...list,
                      data: list.data.map((candidate) =>
                          candidate.id === item.id ? item : candidate,
                      ),
                  }
                : list,
        );
    };
    // The lists are refetched in the background once the last edit of the item is answered.
    const endOptimistic = (id: string, edit: PendingEdit, item?: Item) => {
        const { done, saved } = endEdit(client, resource, id, edit, item);
        if (done && saved) {
            void invalidateLists(client, resource);
        }
    };
    return useMutation({
        mutationFn: ({ id, values, version }: UpdateItemVariables) =>
            optimistic
                ? sendInTurn(client, resource, id, version, (sent) =>
                      adapter.update(resource, id, values, { version: sent }),
                  )
                : adapter.update(resource, id, values, { version }),
        onMutate: ({ id, values }) =>
            optimistic ? startEdit(client, resource, id, values) : undefined,
        onSuccess: (item, { id }, edit) => {
            if (edit !== undefined) {
                endOptimistic(id, edit, item);
                return;
            }
            showSaved(item);
            return invalidateLists(client, resource);
        },
        onError: (error, { id }, edit) => {
            if (edit !== undefined) {
                // A conflict gives the current item: it shows, as the server has it.
                const current = error instanceof ConflictError ? error.current : null;
                endOptimistic(id, edit, current ?? undefined);
            }
        },
    });
}

/** Deletes an item, then removes it from the cache and refetches the lists of the resource. */
export function useDeleteItem(resource: string): UseMutationResult<void, Error, string> {
    const adapter = useDataAdapter();
    const client = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adapter.delete(resource, id),
        onSuccess: (_result, id) => {
            client.removeQueries({ queryKey: queryKeys.item(resource, id) });
            return invalidateLists(client, resource);
        },
    });
}

/**
 * Copies an item (`duplicate()` of the adapter), then caches the copy and refetches the lists of
 * the resource. Fails when the adapter has no `duplicate()`.
 */
export function useDuplicateItem(resource: string): UseMutationResult<Item, Error, string> {
    const adapter = useDataAdapter();
    const client = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => {
            if (adapter.duplicate === undefined) {
                return Promise.reject(new Error('The data adapter can’t duplicate items.'));
            }
            return adapter.duplicate(resource, id);
        },
        onSuccess: (item) => {
            client.setQueryData(queryKeys.item(resource, item.id), item);
            return invalidateLists(client, resource);
        },
    });
}

export interface RunActionVariables extends ActionRequest {
    /** Id of the action. */
    action: string;
}

/**
 * Runs an action of a resource. When it finishes right away, the cache is refreshed as its
 * result asks (`refresh`). When the backend queues it, follow the run with `useActionRun()`.
 */
export function useRunAction(
    resource: string,
): UseMutationResult<ActionResponse, Error, RunActionVariables> {
    const adapter = useDataAdapter();
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({ action, ...request }: RunActionVariables) =>
            adapter.runAction(resource, action, request),
        onSuccess: (response, { selection }) => {
            if (response.run !== undefined) {
                client.setQueryData(queryKeys.actionRun(response.run.id), response.run);
                return client.invalidateQueries({ queryKey: queryKeys.actionRuns(), exact: true });
            }
            return invalidateActionResult(client, resource, response.result, selection);
        },
    });
}

const FINISHED_RUN_STATUSES: ReadonlySet<ActionRun['status']> = new Set([
    'succeeded',
    'partial',
    'failed',
    'cancelled',
]);

/** Whether a run has finished, successfully or not. */
export function isRunFinished(run: ActionRun): boolean {
    return FINISHED_RUN_STATUSES.has(run.status);
}

export interface UseActionRunOptions {
    /** Milliseconds between two checks while the run is not finished. Defaults to 2 seconds. */
    interval?: number;
}

/**
 * Follows a queued action run until it finishes. When it does, the cache is refreshed as its
 * result asks. Nothing is fetched while `id` is `null` or `undefined`.
 */
export function useActionRun(
    id: string | null | undefined,
    { interval = 2000 }: UseActionRunOptions = {},
): UseQueryResult<ActionRun> {
    const adapter = useDataAdapter();
    const client = useQueryClient();
    return useQuery({
        queryKey: queryKeys.actionRun(id ?? ''),
        queryFn:
            id == null
                ? skipToken
                : async ({ signal }) => {
                      const previous = client.getQueryData<ActionRun>(queryKeys.actionRun(id));
                      const run = await adapter.getActionRun(id, { signal });
                      const justFinished =
                          isRunFinished(run) &&
                          (previous === undefined || !isRunFinished(previous));
                      if (justFinished && run.result !== undefined) {
                          await invalidateActionResult(client, run.resource, run.result);
                      }
                      return run;
                  },
        refetchInterval: (query) =>
            query.state.data !== undefined && isRunFinished(query.state.data) ? false : interval,
    });
}
