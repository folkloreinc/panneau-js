import isObject from 'lodash/isObject';
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
        const finalResource = resource || getResource(resources, routeResourceId);
        const { id = null } = finalResource || {};
        return id !== null
            ? route(`resources.${finalRouteName}`, {
                  ...finalParams,
                  resource: id,
              })
            : null;
    };
};

export default useResourceUrlGenerator;
