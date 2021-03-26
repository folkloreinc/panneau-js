import isObject from 'lodash/isObject';
import { useUrlGenerator } from '../contexts/RoutesContext';
import { useResources } from '../contexts/PanneauContext';

const getResource = (resources, resourceId) =>
    resourceId !== null && !isObject(resourceId)
        ? resources.find((it) => it.id === resourceId) || null
        : resourceId;

const useResourceUrlGenerator = (resourceId = null) => {
    const resources = useResources();
    const resource = getResource(resources, resourceId);
    const route = useUrlGenerator();
    return (routeResourceId, routeName = null, params = null) => {
        const finalRouteName = resourceId !== null ? routeResourceId : routeName;
        const finalParams = resourceId !== null ? routeName : params;
        const finalResource = resource || getResource(resources, routeResourceId);
        const { id, has_routes: hasRoutes = false } = finalResource;
        const routePrefix = hasRoutes ? `resources.${id}` : 'resources';
        return route(`${routePrefix}.${finalRouteName}`, {
            ...finalParams,
            resource: id,
        });
    };
};

export default useResourceUrlGenerator;