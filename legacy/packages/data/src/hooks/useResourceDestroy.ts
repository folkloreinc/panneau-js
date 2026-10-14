import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { Resource } from '@panneau/core';

import { useApi } from '../contexts/ApiContext';
import useResourceArguments from './useResourceArguments';

type MutationOptions = UseMutationOptions<unknown, Error, string | void>;

function useResourceDestroy(resource: Resource | string);
function useResourceDestroy(id: string | null);
function useResourceDestroy(resource: Resource | string, id: string | null);
function useResourceDestroy(resource: Resource | string, options: MutationOptions);
function useResourceDestroy(id: string | null, options: MutationOptions);
function useResourceDestroy(
    resource: Resource | string,
    id: string | null,
    options: MutationOptions,
);

function useResourceDestroy(
    resource: Resource | string | null = null,
    id: string | null | MutationOptions = null,
    options: MutationOptions = {},
) {
    const {
        resource: finalResource,
        id: finalId,
        options: finalOptions,
    } = useResourceArguments<MutationOptions>(resource, id, options);
    const { onSuccess: customOnSuccess = null, ...otherOptions } = finalOptions || {};
    const { id: resourceId = null } = finalResource || {};
    const api = useApi();
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isPending, ...other } = useMutation<unknown, Error, string | void>(
        {
            mutationFn: (providedId = null) =>
                api.resources.destroy(finalResource, (providedId ?? finalId) as string),
            onSuccess: (data, variables, ...args) => {
                // Refresh the lists, but not the destroyed item (it would refetch a missing item)
                const destroyedId = variables ?? finalId;
                queryClient.invalidateQueries({
                    queryKey: [resourceId],
                    predicate: ({ queryKey }) => String(queryKey[1]) !== String(destroyedId),
                });
                if (customOnSuccess !== null) {
                    return customOnSuccess(data, variables, ...args);
                }
                return undefined;
            },
            ...otherOptions,
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
