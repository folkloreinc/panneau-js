import isObject from 'lodash/isObject';
import { useUrlGenerator } from '../contexts/RoutesContext';
import { usePanneauResources } from '../contexts/PanneauContext';

const getResource = (resources, resourceId) =>
    resourceId !== null && !isObject(resourceId)
        ? resources.find((it) => it.id === resourceId) || null
        : resourceId;

const useResourceUrlGenerator = (resourceId = null) => {
    const resources = usePanneauResources();
    const resource = getResource(resources, resourceId);
    const route = useUrlGenerator();
    return (routeResourceId, routeName = null, params = null) => {
        const finalRouteName = resourceId !== null ? routeResourceId : routeName;
        const finalParams = resourceId !== null ? routeName : params;
        const finalResource = resource || getResource(resources, routeResourceId);
        const { id, has_routes: hasRoutes = false } = finalResource;
        const routePrefix = hasRoutes ? `resources.${id}` : 'resources';
        // console.log(
        //     'routePrefix',
        //     id,
        //     routePrefix,
        //     finalRouteName,
        //     finalParams,
        //     route(`${routePrefix}.${finalRouteName}`, {
        //         ...finalParams,
        //         resource: id,
        //     }),
        // );
        return route(`${routePrefix}.${finalRouteName}`, {
            ...finalParams,
            resource: id,
        });
    };
};

export default useResourceUrlGenerator;
