import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import isObject from 'lodash-es/isObject';

import { Resource } from '@panneau/core';
import { usePanneauResource, useResource } from '@panneau/core/contexts';

import { useApi } from '../contexts/ApiContext';

function useResourceClone(resource: Resource | string);
function useResourceClone(id: string | null);
function useResourceClone(resource: Resource | string, id: string | null);
function useResourceClone(id: string | null, options: UseMutationOptions);
function useResourceClone(
    resource: Resource | string,
    id: string | null,
    options: UseMutationOptions,
);

function useResourceClone(
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
                api.resources.clone(finalResource, (providedId ?? finalId) as string),
            ...options,
        },
    );
    return {
        clone: mutate,
        cloneAsync: mutateAsync,
        loading: isPending,
        mutate,
        mutateAsync,
        isPending,
        ...other,
    };
}

export default useResourceClone;
