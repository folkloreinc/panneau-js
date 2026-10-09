import isObject from 'lodash-es/isObject';

import { Resource } from '@panneau/core';
import { usePanneauResource, useResource } from '@panneau/core/contexts';

/**
 * Resolve the arguments of resource hooks supporting these call forms:
 * (resource), (id), (resource, id), (resource, options), (id, options), (resource, id, options)
 *
 * The first argument is the resource when it is an object or a known resource id, or when a
 * non-null id is passed as second argument. Otherwise, it is considered as the item id and the
 * resource from the context is used.
 */
function useResourceArguments<TOptions extends object>(
    resource: Resource | string | null,
    id: string | null | TOptions,
    options: TOptions,
): { resource: Resource | null; id: string | null; options: TOptions } {
    const idIsOptions = isObject(id);
    const providedResource = usePanneauResource(resource);
    const contextResource = useResource();
    const resourceIsExplicit = providedResource !== null || (!idIsOptions && id !== null);
    return {
        resource: providedResource || contextResource || null,
        id: resourceIsExplicit
            ? ((idIsOptions ? null : id) as string | null)
            : (resource as string),
        options: idIsOptions ? (id as TOptions) : options,
    };
}

export default useResourceArguments;
