import { Route } from 'wouter';

import type { ComponentsManager, Resource, ResourcePages } from '@panneau/core';

import {
    ResourceCreate,
    ResourceDelete,
    ResourceDuplicate,
    ResourceEdit,
    ResourceIndex,
    ResourceShow,
} from './pages';

interface CreateResourceRoutesParams {
    route: (name: string, params?: Record<string, string>) => string;
    componentsManager: ComponentsManager;
    pages?: ResourcePages;
}

function createResourceRoutes(
    resource: Resource,
    { route, componentsManager, pages = {} }: CreateResourceRoutesParams,
) {
    const { id: resourceId, pages: resourcePages = {}, extraRoutes = [] } = resource;

    // Resolution order: resource typed key (`pages.show`), resource legacy key
    // (`pages.resourceShowPage`), panneau typed key (`pages.show`), panneau legacy key
    // (`pages.showPage`), then the built-in page
    const ResourceIndexComponent =
        componentsManager.getComponent(resourcePages?.index?.component) ||
        componentsManager.getComponent(resourcePages?.resourceIndexPage?.component) ||
        componentsManager.getComponent(pages?.index?.component) ||
        componentsManager.getComponent(pages?.indexPage?.component) ||
        ResourceIndex;
    const ResourceShowComponent =
        componentsManager.getComponent(resourcePages?.show?.component) ||
        componentsManager.getComponent(resourcePages?.resourceShowPage?.component) ||
        componentsManager.getComponent(pages?.show?.component) ||
        componentsManager.getComponent(pages?.showPage?.component) ||
        ResourceShow;
    const ResourceCreateComponent =
        componentsManager.getComponent(resourcePages?.create?.component) ||
        componentsManager.getComponent(resourcePages?.resourceCreatePage?.component) ||
        componentsManager.getComponent(pages?.create?.component) ||
        componentsManager.getComponent(pages?.createPage?.component) ||
        ResourceCreate;
    const ResourceEditComponent =
        componentsManager.getComponent(resourcePages?.edit?.component) ||
        componentsManager.getComponent(resourcePages?.resourceEditPage?.component) ||
        componentsManager.getComponent(pages?.edit?.component) ||
        componentsManager.getComponent(pages?.editPage?.component) ||
        ResourceEdit;
    const ResourceDeleteComponent =
        componentsManager.getComponent(resourcePages?.delete?.component) ||
        componentsManager.getComponent(resourcePages?.resourceDeletePage?.component) ||
        componentsManager.getComponent(pages?.delete?.component) ||
        componentsManager.getComponent(pages?.deletePage?.component) ||
        ResourceDelete;
    const ResourceDuplicateComponent =
        componentsManager.getComponent(resourcePages?.duplicate?.component) ||
        componentsManager.getComponent(resourcePages?.resourceDuplicatePage?.component) ||
        componentsManager.getComponent(pages?.duplicate?.component) ||
        componentsManager.getComponent(pages?.duplicatePage?.component) ||
        ResourceDuplicate;

    // Extra routes are registered first so they are not shadowed by the
    // generic `/:resource/:id` show route
    const extraRoutesElements = extraRoutes.map(({ path, component, ...pageProps }) => {
        const RouteComponent = componentsManager.getComponent(component);
        return RouteComponent !== null ? (
            <Route key={`route-${path}`} path={path}>
                {() => <RouteComponent resource={resource} {...pageProps} />}
            </Route>
        ) : null;
    });

    return [
        ...extraRoutesElements,
        <Route
            key={`${resourceId}-create`}
            path={route('resources.create', {
                resource: resourceId,
            })}
        >
            {() => <ResourceCreateComponent resource={resource} />}
        </Route>,
        <Route<{ id: string }>
            key={`${resourceId}-show`}
            path={route('resources.show', {
                resource: resourceId,
                id: ':id',
            })}
        >
            {({ id = null }) => <ResourceShowComponent itemId={id} resource={resource} />}
        </Route>,
        <Route<{ id: string }>
            key={`${resourceId}-edit`}
            path={route('resources.edit', {
                resource: resourceId,
                id: ':id',
            })}
        >
            {({ id = null }) => <ResourceEditComponent itemId={id} resource={resource} />}
        </Route>,
        <Route<{ id: string }>
            key={`${resourceId}-delete`}
            path={route('resources.delete', {
                resource: resourceId,
                id: ':id',
            })}
        >
            {({ id = null }) => <ResourceDeleteComponent itemId={id} resource={resource} />}
        </Route>,
        <Route<{ id: string }>
            key={`${resourceId}-duplicate`}
            path={route('resources.duplicate', {
                resource: resourceId,
                id: ':id',
            })}
        >
            {({ id = null }) => <ResourceDuplicateComponent itemId={id} resource={resource} />}
        </Route>,
        <Route
            key={`${resourceId}-index`}
            path={route('resources.index', {
                resource: resourceId,
            })}
        >
            {() => <ResourceIndexComponent resource={resource} />}
        </Route>,
    ];
}

export default createResourceRoutes;
