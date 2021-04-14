import React from 'react';
import { Switch, Route } from 'react-router';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useUrlGenerator } from '@panneau/core/contexts';

import ResourceIndex from './pages/ResourceIndex';
import ResourceCreate from './pages/ResourceCreate';
import ResourceShow from './pages/ResourceShow';
import ResourceEdit from './pages/ResourceEdit';
import ResourceDelete from './pages/ResourceDelete';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceRoutes = ({ resource }) => {
    const { id: resourceId, has_routes: hasRoutes } = resource;
    const route = useUrlGenerator();
    const routeName = hasRoutes ? `resources.${resourceId}` : 'resources';

    return (
        <Switch>
            <Route
                path={route(`${routeName}.index`, {
                    resource: resourceId,
                })}
                exact
                render={() => <ResourceIndex resource={resource} />}
            />
            <Route
                path={route(`${routeName}.create`, {
                    resource: resourceId,
                })}
                exact
                render={() => <ResourceCreate resource={resource} />}
            />
            <Route
                path={route(`${routeName}.show`, {
                    resource: resourceId,
                    id: ':id',
                })}
                exact
                render={({
                    match: {
                        params: { id },
                    },
                }) => <ResourceShow resource={resource} itemId={id} />}
            />
            <Route
                path={route(`${routeName}.edit`, {
                    resource: resourceId,
                    id: ':id',
                })}
                exact
                render={({
                    match: {
                        params: { id },
                    },
                }) => <ResourceEdit resource={resource} itemId={id} />}
            />
            <Route
                path={route(`${routeName}.delete`, {
                    resource: resourceId,
                    id: ':id',
                })}
                exact
                render={({
                    match: {
                        params: { id },
                    },
                }) => <ResourceDelete resource={resource} itemId={id} />}
            />
        </Switch>
    );
};
ResourceRoutes.propTypes = propTypes;
ResourceRoutes.defaultProps = defaultProps;

export default ResourceRoutes;
