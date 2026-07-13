import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { isObject, isString } from 'lodash-es';

import { Resource, ResourceItem } from '@panneau/core';
import { usePanneauResource, useResource } from '@panneau/core/contexts';

import { useApi } from '../contexts/ApiContext';

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
    const providedResource = usePanneauResource(
        isObject(resource) || isString(id) ? resource : null,
    );
    const contextResource = useResource();
    const finalResource = providedResource || contextResource;
    const finalId = !isObject(id) ? id : (resource as string);
    const finalOptions = isObject(id) ? id : options;
    const api = useApi();
    const { mutate, mutateAsync, isPending, ...other } = useMutation<T, Error, TData>({
        mutationFn: (data) => api.resources.update<T>(finalResource, finalId, data),
        ...finalOptions,
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
