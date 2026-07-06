import { isString } from 'lodash';
import isObject from 'lodash-es/isObject';

import { usePanneauResources, useResource, useRoutes, useUrlGenerator } from '../contexts';
import type { Resource } from '../types';

function getResource(resources: Resource[], resourceId: string | Resource | null): Resource | null {
    return resourceId !== null && !isObject(resourceId)
        ? resources.find((it) => it.id === resourceId) || null
        : (resourceId as Resource);
}

type ResourceUrlGenerator = (
    routeResourceId: string | Resource,
    routeName?: string | Record<string, unknown> | null,
    params?: Record<string, unknown> | null,
) => string | null;

function useResourceUrlGenerator(): (
    routeResourceId: string | Resource,
    routeName?: string,
    params?: Record<string, unknown> | null,
) => string | null;
function useResourceUrlGenerator(
    resourceId: string | Resource,
): (routeName?: string, params?: Record<string, unknown> | null) => string | null;
function useResourceUrlGenerator(resourceId: string | Resource | null = null) {
    const resources = usePanneauResources();
    const contextResource = useResource();
    const resource = getResource(resources, resourceId) || contextResource;
    const route = useUrlGenerator();
    const routes = useRoutes();

    function generateUrl(routeName: string): string | null;
    function generateUrl(routeName: string, params: Record<string, unknown>): string | null;
    function generateUrl(routeResourceId: string | Resource, routeName: string): string | null;
    function generateUrl(
        routeResourceId: string | Resource,
        routeName: string,
        params: Record<string, unknown>,
    ): string | null;
    function generateUrl(
        routeResourceId: string | Resource,
        routeName: string | Record<string, unknown> | null = null,
        params: Record<string, unknown> | null = null,
    ): string | null {
        const hasResourceId = isString(routeResourceId) && isString(routeName);
        const finalRouteName = hasResourceId ? routeName : (routeResourceId as string);
        const finalParams = hasResourceId ? params : (routeName as Record<string, unknown> | null);
        const finalResource = hasResourceId ? getResource(resources, routeResourceId) : resource;
        const { id = null } = finalResource || {};
        const specificRouteName = `resources.${id}.${finalRouteName}`;
        const hasSpecificRoute = typeof routes[specificRouteName] !== 'undefined';
        const finalRoute =
            id !== null
                ? route(
                      hasSpecificRoute ? specificRouteName : `resources.${finalRouteName}`,
                      hasSpecificRoute
                          ? finalParams
                          : {
                                ...finalParams,
                                resource: id,
                            },
                  )
                : null;
        return finalRoute;
    }

    return generateUrl;
}

export default useResourceUrlGenerator;
