import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import isObject from 'lodash-es/isObject';

import { Resource } from '@panneau/core';
import { usePanneauResource, useResource } from '@panneau/core/contexts';

import { useApi } from '../contexts/ApiContext';

function useResourceRestore(resource: Resource | string);
function useResourceRestore(id: string | null);
function useResourceRestore(resource: Resource | string, id: string | null);
function useResourceRestore(id: string | null, options: UseMutationOptions);
function useResourceRestore(
    resource: Resource | string,
    id: string | null,
    options: UseMutationOptions,
);

function useResourceRestore(
    resource: Resource | string | null = null,
    id: string | null | UseMutationOptions = null,
    options: UseMutationOptions = {},
) {
    const providedResource = usePanneauResource(id !== null && !isObject(id) ? resource : null);
    const contextResource = useResource();
    const finalResource = providedResource || contextResource;
    const finalId = providedResource !== null ? (id as string) : (resource as string);
    const api = useApi();
    const { mutate, mutateAsync, isPending, ...other } = useMutation<unknown, Error, string | void>(
        {
            mutationFn: (providedId = null) =>
                api.resources.restore(finalResource, (providedId ?? finalId) as string),
            ...options,
        },
    );
    return {
        restore: mutate,
        restoreAsync: mutateAsync,
        loading: isPending,
        mutate,
        mutateAsync,
        isPending,
        ...other,
    };
}

export default useResourceRestore;
