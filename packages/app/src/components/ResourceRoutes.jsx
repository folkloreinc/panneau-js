import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useUrlGenerator } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import React from 'react';
import { Route, Switch } from 'react-router';
import * as basePages from './pages';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceRoutes = ({ resource }) => {
    const { id: resourceId, pages = {} } = resource;

    const route = useUrlGenerator();

    // Load custom pages from resource
    const {
        index: indexPage = null,
        show: showPage = null,
        create: createPage = null,
        edit: editPage = null,
        delete: deletePage = null,
    } = pages || {};

    const ResourceIndexComponent = getComponentFromName(
        indexPage?.component || 'resource-index',
        basePages,
        indexPage?.component,
    );

    const ResourceShowComponent = getComponentFromName(
        showPage?.component || 'resource-show',
        basePages,
        showPage?.component,
    );

    const ResourceCreateComponent = getComponentFromName(
        createPage?.component || 'resource-create',
        basePages,
        createPage?.component,
    );

    const ResourceEditComponent = getComponentFromName(
        editPage?.component || 'resource-edit',
        basePages,
        editPage?.component,
    );

    const ResourceDeleteComponent = getComponentFromName(
        deletePage?.component || 'resource-delete',
        basePages,
        deletePage?.component,
    );

    return (
        <Switch>
            <Route
                path={route('resources.index', {
                    resource: resourceId,
                })}
                exact
                render={() => <ResourceIndexComponent resource={resource} />}
            />
            <Route
                path={route('resources.create', {
                    resource: resourceId,
                })}
                exact
                render={() => <ResourceCreateComponent resource={resource} />}
            />
            <Route
                path={route('resources.show', {
                    resource: resourceId,
                    id: ':id',
                })}
                exact
                render={({
                    match: {
                        params: { id },
                    },
                }) => <ResourceShowComponent resource={resource} itemId={id} />}
            />
            <Route
                path={route('resources.edit', {
                    resource: resourceId,
                    id: ':id',
                })}
                exact
                render={({
                    match: {
                        params: { id },
                    },
                }) => <ResourceEditComponent resource={resource} itemId={id} />}
            />
            <Route
                path={route('resources.delete', {
                    resource: resourceId,
                    id: ':id',
                })}
                exact
                render={({
                    match: {
                        params: { id },
                    },
                }) => <ResourceDeleteComponent resource={resource} itemId={id} />}
            />
        </Switch>
    );
};
ResourceRoutes.propTypes = propTypes;
ResourceRoutes.defaultProps = defaultProps;

export default ResourceRoutes;
