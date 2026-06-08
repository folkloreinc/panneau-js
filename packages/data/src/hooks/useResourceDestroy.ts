import { UseMutationOptions, UseMutationResult, useMutation } from '@tanstack/react-query';
import isObject from 'lodash-es/isObject';

import { Resource } from '@panneau/core';
import { usePanneauResource, useResource } from '@panneau/core/contexts';

import { useApi } from '../contexts/ApiContext';

type UseResourceDestroyResult = UseMutationResult & {
    destroy: (id?: string) => void;
    destroyAsync: (id?: string) => Promise<unknown>;
    loading: boolean;
};

function useResourceDestroy(id: string | null): UseResourceDestroyResult;
function useResourceDestroy(
    id: string | null,
    options: UseMutationOptions,
): UseResourceDestroyResult;
function useResourceDestroy(
    resource: Resource | string,
    id: string | null,
): UseResourceDestroyResult;
function useResourceDestroy(
    resource: Resource | string,
    id: string | null,
    options: UseMutationOptions,
): UseResourceDestroyResult;

function useResourceDestroy(
    resource: Resource | string | null = null,
    id: string | null | UseMutationOptions = null,
    options: UseMutationOptions = {},
): UseResourceDestroyResult {
    const providedResource = usePanneauResource(id !== null && !isObject(id) ? resource : null);
    const contextResource = useResource();
    const finalResource = providedResource || contextResource;
    const finalId = providedResource !== null ? id : resource;
    const api = useApi();
    const { mutate, mutateAsync, isPending, ...other } = useMutation<unknown, Error, string | void>(
        {
            mutationFn: (providedId) => {
                return api.resources.destroy(finalResource, providedId || finalId);
            },
            ...options,
        },
    );
    return {
        destroy: mutate,
        destroyAsync: mutateAsync,
        loading: isPending,
        mutate,
        mutateAsync,
        isPending,
        ...other,
    };
}

export default useResourceDestroy;
