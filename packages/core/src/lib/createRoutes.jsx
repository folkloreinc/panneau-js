import React from 'react';
import { Route } from 'react-router';
import get from 'lodash/get';

import Layout from '../components/Layout';
import Home from '../components/pages/Home';
import ResourceIndex from '../components/pages/ResourceIndex';
import ResourceCreate from '../components/pages/ResourceCreate';
import ResourceShow from '../components/pages/ResourceShow';
import ResourceEdit from '../components/pages/ResourceEdit';
import ResourceDelete from '../components/pages/ResourceDelete';

const generateRoutesForResource = (routesDefinition, id) => (
    <Route
        key={`resource-route-${id}`}
    >
        <Route path={routesDefinition.index} component={ResourceIndex} />
        <Route path={routesDefinition.create} component={ResourceCreate} />
        <Route path={routesDefinition.show} component={ResourceShow} />
        <Route path={routesDefinition.edit} component={ResourceEdit} />
        <Route path={routesDefinition.delete} component={ResourceDelete} />
    </Route>
);

export default (urlGenerator, definition) => {
    const defaultRoutes = {
        index: urlGenerator.route('resource.index'),
        create: urlGenerator.route('resource.create'),
        show: urlGenerator.route('resource.show'),
        edit: urlGenerator.route('resource.edit'),
        delete: urlGenerator.route('resource.delete'),
    };

    const resourcesWithRoutes = get(definition, 'resources', [])
        .filter(resource => typeof resource.routes !== 'undefined');

    return (
        <Route component={Layout}>
            <Route path="/" component={Home} />
            {
                generateRoutesForResource(defaultRoutes, 'default')
            }
            {
                resourcesWithRoutes
                    .map(resource => generateRoutesForResource(resource.routes, resource.id))
            }
        </Route>
    );
};
