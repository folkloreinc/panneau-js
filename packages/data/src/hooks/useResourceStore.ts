import { useMutation } from '@tanstack/react-query';

import { Resource, ResourceItem } from '@panneau/core';
import { usePanneauResource, useResource } from '@panneau/core/contexts';

import { useApi } from '../contexts/ApiContext';

function useResourceStore(resource: Resource | string, options);
function useResourceStore(options);
function useResourceStore<
    T = ResourceItem,
    TData extends Record<string, unknown> = Record<string, unknown>,
>(resource: Resource | string, options = {}) {
    const providedResource = usePanneauResource(resource);
    const contextResource = useResource();
    const finalResource = providedResource || contextResource;
    const api = useApi();
    const { mutate, mutateAsync, isPending, ...other } = useMutation<T, Error, TData>({
        mutationFn: (data) => api.resources.store<T>(finalResource, data),
        ...options,
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
