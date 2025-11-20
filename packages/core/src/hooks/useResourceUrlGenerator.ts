import isObject from 'lodash-es/isObject';

import type { Resource } from '@panneau/core/types';

import { usePanneauResources, useResource, useUrlGenerator } from '../contexts';

const getResource = (
    resources: Resource[],
    resourceId: string | Resource | null,
): Resource | null =>
    resourceId !== null && !isObject(resourceId)
        ? resources.find((it) => it.id === resourceId) || null
        : (resourceId as Resource);

type ResourceUrlGenerator = (
    routeResourceId: string | Resource,
    routeName?: string | Record<string, unknown> | null,
    params?: Record<string, unknown> | null,
) => string | null;

const useResourceUrlGenerator = (
    resourceId: string | Resource | null = null,
): ResourceUrlGenerator => {
    const resources = usePanneauResources();
    const contextResource = useResource();
    const resource = getResource(resources, resourceId) || contextResource;
    const route = useUrlGenerator();
    return (
        routeResourceId: string | Resource,
        routeName: string | Record<string, unknown> | null = null,
        params: Record<string, unknown> | null = null,
    ): string | null => {
        const finalRouteName = resourceId !== null ? routeResourceId : routeName;
        const finalParams = resourceId !== null ? routeName : params;
        const finalResource = getResource(resources, routeResourceId) || resource;
        const { id = null } = finalResource || {};
        const finalRoute =
            id !== null
                ? route(`resources.${finalRouteName as string}`, {
                      ...(finalParams as Record<string, unknown>),
                      resource: id,
                  })
                : null;
        return finalRoute;
    };
};

export default useResourceUrlGenerator;
