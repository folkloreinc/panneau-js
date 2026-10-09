import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { Resource } from '@panneau/core';

import { useApi } from '../contexts/ApiContext';
import useResourceArguments from './useResourceArguments';

type MutationOptions = UseMutationOptions<unknown, Error, string | void>;

function useResourceClone(resource: Resource | string);
function useResourceClone(id: string | null);
function useResourceClone(resource: Resource | string, id: string | null);
function useResourceClone(resource: Resource | string, options: MutationOptions);
function useResourceClone(id: string | null, options: MutationOptions);
function useResourceClone(resource: Resource | string, id: string | null, options: MutationOptions);

function useResourceClone(
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
                api.resources.clone(finalResource, (providedId ?? finalId) as string),
            onSuccess: (data, variables, ...args) => {
                queryClient.invalidateQueries({
                    queryKey: [resourceId],
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
