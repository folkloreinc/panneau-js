/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Route } from 'wouter';

import { ResourceCreate, ResourceDelete, ResourceEdit, ResourceIndex, ResourceShow } from './pages';

const createResourceRoutes = (resource, { route, componentsManager, pages = {} }) => {
    const { id: resourceId, pages: resourcePages = {}, extraRoutes = [] } = resource;

    // Load custom pages from resource
    const {
        index: indexPage = null,
        show: showPage = null,
        create: createPage = null,
        edit: editPage = null,
        delete: deletePage = null,
    } = pages || {};

    const {
        index: resourceIndexPage = null,
        show: resourceShowPage = null,
        create: resourceCreatePage = null,
        edit: resourceEditPage = null,
        delete: resourceDeletePage = null,
    } = resourcePages || {};

    const ResourceIndexComponent =
        componentsManager.getComponent(resourceIndexPage?.component) ||
        componentsManager.getComponent(indexPage?.component) ||
        ResourceIndex;
    const ResourceShowComponent =
        componentsManager.getComponent(resourceShowPage?.component) ||
        componentsManager.getComponent(showPage?.component) ||
        ResourceShow;
    const ResourceCreateComponent =
        componentsManager.getComponent(resourceCreatePage?.component) ||
        componentsManager.getComponent(createPage?.component) ||
        ResourceCreate;
    const ResourceEditComponent =
        componentsManager.getComponent(resourceEditPage?.component) ||
        componentsManager.getComponent(editPage?.component) ||
        ResourceEdit;
    const ResourceDeleteComponent =
        componentsManager.getComponent(resourceDeletePage?.component) ||
        componentsManager.getComponent(deletePage?.component) ||
        ResourceDelete;

    return [
        <Route
            key={`${resourceId}-create`}
            path={route('resources.create', {
                resource: resourceId,
            })}
            exact
        >
            {() => <ResourceCreateComponent resource={resource} />}
        </Route>,
        <Route
            key={`${resourceId}-show`}
            path={route('resources.show', {
                resource: resourceId,
                id: ':id',
            })}
        >
            {() => <ResourceShowComponent resource={resource} />}
        </Route>,
        <Route
            key={`${resourceId}-edit`}
            path={route('resources.edit', {
                resource: resourceId,
                id: ':id',
            })}
        >
            {() => <ResourceEditComponent resource={resource} />}
        </Route>,
        <Route
            key={`${resourceId}-delete`}
            path={route('resources.delete', {
                resource: resourceId,
                id: ':id',
            })}
        >
            {() => <ResourceDeleteComponent resource={resource} />}
        </Route>,
        ...extraRoutes.map(({ path, component, ...pageProps }) => {
            const RouteComponent = componentsManager.getComponent(component);
            return RouteComponent !== null ? (
                <Route key={`route-${path}`} path={path}>
                    {() => <RouteComponent resource={resource} {...pageProps} />}
                </Route>
            ) : null;
        }),
        <Route
            key={`${resourceId}-index`}
            path={route('resources.index', {
                resource: resourceId,
            })}
        >
            {() => <ResourceIndexComponent resource={resource} />}
        </Route>,
    ];
};

export default createResourceRoutes;
