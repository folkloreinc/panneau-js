/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useComponentsManager, useUrlGenerator } from '@panneau/core/contexts';
import React from 'react';
import { Route, Switch } from 'react-router';
import { ResourceCreate, ResourceDelete, ResourceEdit, ResourceIndex, ResourceShow } from './pages';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceRoutes = ({ resource }) => {
    const { id: resourceId, pages = {}, extraRoutes = [] } = resource;

    const route = useUrlGenerator();
    const componentsManager = useComponentsManager();

    // Load custom pages from resource
    const {
        index: indexPage = null,
        show: showPage = null,
        create: createPage = null,
        edit: editPage = null,
        delete: deletePage = null,
    } = pages || {};

    const ResourceIndexComponent =
        indexPage !== null && typeof indexPage.component !== 'undefined'
            ? componentsManager.getComponent(indexPage.component)
            : ResourceIndex;

    const ResourceShowComponent =
        showPage !== null && typeof showPage.component !== 'undefined'
            ? componentsManager.getComponent(showPage.component)
            : ResourceShow;

    const ResourceCreateComponent =
        createPage !== null && typeof createPage.component !== 'undefined'
            ? componentsManager.getComponent(createPage.component)
            : ResourceCreate;

    const ResourceEditComponent =
        editPage !== null && typeof editPage.component !== 'undefined'
            ? componentsManager.getComponent(editPage.component)
            : ResourceEdit;

    const ResourceDeleteComponent =
        deletePage !== null && typeof deletePage.component !== 'undefined'
            ? componentsManager.getComponent(deletePage.component)
            : ResourceDelete;

    return (
        <Switch>
            {extraRoutes.map(({ path, component, exact = true, ...pageProps }) => {
                const RouteComponent = componentsManager.getComponent(component);
                return RouteComponent !== null ? (
                    <Route
                        key={`route-${path}`}
                        path={path}
                        exact={exact}
                        render={({
                            match: {
                                params: { id, ...params },
                            },
                        }) => (
                            <RouteComponent
                                resource={resource}
                                itemId={id}
                                {...pageProps}
                                {...params}
                            />
                        )}
                    />
                ) : null;
            })}
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
