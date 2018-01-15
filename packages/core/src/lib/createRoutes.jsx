import React from 'react';
import { Route } from 'react-router';
import get from 'lodash/get';

import Layout from '../components/Layout';
import Home from '../components/pages/Home';
import ResourceIndex from '../components/pages/ResourceIndex';
import ResourceCreate from '../components/pages/ResourceCreate';
import ResourceEdit from '../components/pages/ResourceEdit';
import ResourceDelete from '../components/pages/ResourceDelete';

import defaultRoutes from '../defaults/routes.json';

const generateRoutesForResource = (routesDefinition, id) => (
    <Route
        key={`resource-route-${id}`}
    >
        <Route path={routesDefinition.index} component={ResourceIndex} />
        <Route path={routesDefinition.create} component={ResourceCreate} />
        <Route path={routesDefinition.edit} component={ResourceEdit} />
        <Route path={routesDefinition.delete} component={ResourceDelete} />
    </Route>
);

export default (urlGenerator, definition) => {
    const routes = get(definition, 'routes', defaultRoutes);
    const resources = get(definition, 'resources', []);
    const filteredRoutes = Object
        .keys(routes)
        .filter(key => key.match(/^resource./))
        .reduce((map, key) => ({
            ...map,
            [key.replace(/^resource./, '')]: routes[key],
        }), {});

    return (
        <Route component={Layout}>
            <Route path="/" component={Home} />
            {
                generateRoutesForResource(filteredRoutes, 'default')
            }
            {
                resources
                    .filter(resource => typeof resource.routes !== 'undefined')
                    .map(resource => generateRoutesForResource(resource.routes, resource.id))
            }
        </Route>
    );
};
