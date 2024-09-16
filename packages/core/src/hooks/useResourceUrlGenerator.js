import isObject from 'lodash-es/isObject';

import { usePanneauResources, useResource, useUrlGenerator } from '../contexts';

const getResource = (resources, resourceId) =>
    resourceId !== null && !isObject(resourceId)
        ? resources.find((it) => it.id === resourceId) || null
        : resourceId;

const useResourceUrlGenerator = (resourceId = null) => {
    const resources = usePanneauResources();
    const contextResource = useResource();
    const resource = getResource(resources, resourceId) || contextResource;
    const route = useUrlGenerator();
    return (routeResourceId, routeName = null, params = null) => {
        const finalRouteName = resourceId !== null ? routeResourceId : routeName;
        const finalParams = resourceId !== null ? routeName : params;
        const finalResource = getResource(resources, routeResourceId) || resource;
        const { id = null } = finalResource || {};
        console.log('route name', finalRouteName, id, finalParams);
        const finalRoute =
            id !== null
                ? route(`resources.${finalRouteName}`, {
                      ...finalParams,
                      resource: id,
                  })
                : null;
        // console.log('route', finalRoute);
        return finalRoute;
    };
};

export default useResourceUrlGenerator;
