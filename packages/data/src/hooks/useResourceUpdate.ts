import { useMutation } from '@tanstack/react-query';
import { isObject, isString } from 'lodash-es';

import { Resource, ResourceItem } from '@panneau/core';
import { usePanneauResource, useResource } from '@panneau/core/contexts';

import { useApi } from '../contexts/ApiContext';

function useResourceUpdate(resource: Resource | string, id: string, options);
function useResourceUpdate(id: string, options);
function useResourceUpdate<
    T = ResourceItem,
    TData extends Record<string, unknown> = Record<string, unknown>,
>(resource: Resource | string, id: string, options = {}) {
    const providedResource = usePanneauResource(
        isObject(resource) || isString(id) ? resource : null,
    );
    const contextResource = useResource();
    const finalResource = providedResource || contextResource;
    const finalId = !isObject(id) ? id : (resource as string);
    const api = useApi();
    const { mutate, mutateAsync, isPending, ...other } = useMutation<T, Error, TData>({
        mutationFn: (data) => api.resources.update<T>(finalResource, finalId, data),
        ...options,
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
