import {
    type UseMutationResult,
    type UseQueryOptions,
    type UseQueryResult,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import type {
    ActionRequest,
    ActionRun,
    Definition,
    Item,
    ListQuery,
    ListResponse,
} from '@panneau/protocol';

import type { ActionResponse, Values } from '../adapter';
import { useDataAdapter } from './context';
import { queryKeys } from './keys';
import {
    definitionQueryOptions,
    resourceItemQueryOptions,
    resourceListQueryOptions,
} from './options';
import { invalidateActionResult } from './refresh';

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

/** Creates an item, then refetches the lists of the resource. */
export function useCreateItem(resource: string): UseMutationResult<Item, Error, Values> {
    const adapter = useDataAdapter();
    const client = useQueryClient();
    return useMutation({
        mutationFn: (values: Values) => adapter.create(resource, values),
        onSuccess: (item) => {
            client.setQueryData(queryKeys.item(resource, item.id), item);
            return client.invalidateQueries({ queryKey: queryKeys.lists(resource) });
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

/**
 * Updates an item, then caches the updated item and refetches the lists of the resource. Fails
 * with a `ConflictError` when the item changed since `version`.
 */
export function useUpdateItem(
    resource: string,
): UseMutationResult<Item, Error, UpdateItemVariables> {
    const adapter = useDataAdapter();
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({ id, values, version }: UpdateItemVariables) =>
            adapter.update(resource, id, values, { version }),
        onSuccess: (item) => {
            client.setQueryData(queryKeys.item(resource, item.id), item);
            return client.invalidateQueries({ queryKey: queryKeys.lists(resource) });
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
            return client.invalidateQueries({ queryKey: queryKeys.lists(resource) });
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
