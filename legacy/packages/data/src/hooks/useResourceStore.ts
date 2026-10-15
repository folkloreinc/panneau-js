import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { Resource, ResourceItem } from '@panneau/core';
import { usePanneauResource, useResource } from '@panneau/core/contexts';

import { useApi } from '../contexts/ApiContext';

function useResourceStore(resource: Resource | string, options);
function useResourceStore(options);
function useResourceStore<
    T = ResourceItem,
    TData extends Record<string, unknown> = Record<string, unknown>,
>(resource: Resource | string, options: UseMutationOptions<T, Error, TData> = {}) {
    const providedResource = usePanneauResource(resource);
    const contextResource = useResource();
    const finalResource = providedResource || contextResource;
    const { id: resourceId = null } = finalResource || {};
    const { onSuccess: customOnSuccess = null, ...otherOptions } = options || {};
    const api = useApi();
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isPending, ...other } = useMutation<T, Error, TData>({
        mutationFn: (data) => api.resources.store<T>(finalResource, data),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({
                queryKey: [resourceId],
            });
            if (customOnSuccess !== null) {
                return customOnSuccess(data, ...args);
            }
            return undefined;
        },
        ...otherOptions,
    });
    return {
        store: mutate,
        storeAsync: mutateAsync,
        loading: isPending,
        mutate,
        mutateAsync,
        isPending,
        ...other,
    };
}

export default useResourceStore;
