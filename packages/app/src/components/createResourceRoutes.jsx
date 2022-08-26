/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Route } from 'react-router';

import { ResourceCreate, ResourceDelete, ResourceEdit, ResourceIndex, ResourceShow } from './pages';

const createResourceRoutes = (resource, { route, componentsManager }) => {
    const { id: resourceId, pages = {}, extraRoutes = [] } = resource;

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
        <>
            {extraRoutes.map(({ path, component, exact = true, ...pageProps }) => {
                const RouteComponent = componentsManager.getComponent(component);
                return RouteComponent !== null ? (
                    <Route
                        key={`route-${path}`}
                        path={path}
                        exact={exact}
                        element={<RouteComponent resource={resource} {...pageProps} />}
                    />
                ) : null;
            })}
            <Route
                path={route('resources.index', {
                    resource: resourceId,
                })}
                exact
                element={<ResourceIndexComponent resource={resource} />}
            />
            <Route
                path={route('resources.create', {
                    resource: resourceId,
                })}
                exact
                element={<ResourceCreateComponent resource={resource} />}
            />
            <Route
                path={route('resources.show', {
                    resource: resourceId,
                    id: ':id',
                })}
                exact
                element={<ResourceShowComponent resource={resource} />}
            />
            <Route
                path={route('resources.edit', {
                    resource: resourceId,
                    id: ':id',
                })}
                exact
                element={<ResourceEditComponent resource={resource} />}
            />
            <Route
                path={route('resources.delete', {
                    resource: resourceId,
                    id: ':id',
                })}
                exact
                element={<ResourceDeleteComponent resource={resource} />}
            />
        </>
    );
};

export default createResourceRoutes;
