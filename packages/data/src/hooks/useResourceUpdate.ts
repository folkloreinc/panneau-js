import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { Resource, ResourceItem } from '@panneau/core';

import { useApi } from '../contexts/ApiContext';
import useResourceArguments from './useResourceArguments';

function useResourceUpdate(resource: Resource | string, id: string);
function useResourceUpdate(resource: Resource | string, id: string, options: UseMutationOptions);
function useResourceUpdate(id: string);
function useResourceUpdate(id: string, options: UseMutationOptions);
function useResourceUpdate<
    T = ResourceItem,
    TData extends Record<string, unknown> = Record<string, unknown>,
>(
    resource: Resource | string,
    id: string | UseMutationOptions<T, Error, TData> = null,
    options: UseMutationOptions<T, Error, TData> = {},
) {
    const {
        resource: finalResource,
        id: finalId,
        options: finalOptions,
    } = useResourceArguments<UseMutationOptions<T, Error, TData>>(resource, id, options);
    const { onSuccess: customOnSuccess = null, ...otherOptions } = finalOptions || {};
    const { id: resourceId = null } = finalResource || {};
    const api = useApi();
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isPending, ...other } = useMutation<T, Error, TData>({
        mutationFn: (data) => api.resources.update<T>(finalResource, finalId, data),
        onSuccess: (data, ...args) => {
            // Queries never go stale: keep the item and the lists in sync with the saved data
            queryClient.setQueryData([resourceId, String(finalId)], data);
            queryClient.invalidateQueries({
                queryKey: [resourceId],
                predicate: ({ queryKey }) => String(queryKey[1]) !== String(finalId),
            });
            if (customOnSuccess !== null) {
                return customOnSuccess(data, ...args);
            }
            return undefined;
        },
        ...otherOptions,
    });
    return {
        update: mutate,
        updateAsync: mutateAsync,
        loading: isPending,
        mutate,
        mutateAsync,
        isPending,
        ...other,
    };
}

export default useResourceUpdate;
