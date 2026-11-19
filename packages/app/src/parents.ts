import { canViewPage, findResource, resolveResource } from '@panneau/core';
import type { Definition } from '@panneau/protocol';

import { type NavEntry, capitalize, isCurrent } from './navigation';
import { type AppRoute, routePath } from './routes';

/** A parent of a page: a page of `pages`, or the list of a resource (decision 0093). */
export type ParentRoute =
    { name: 'page'; page: string } | { name: 'resource.index'; resource: string };

/** A parent of a page, as its header shows it: a link above the title. */
export interface PageParent {
    /** The path of the parent, through the app's router. */
    href: string;
    /** `undefined` while it loads: a skeleton. */
    label: string | undefined;
}

const HOME_PAGE = 'home';

function key(route: ParentRoute): string {
    return route.name === 'page' ? `page:${route.page}` : `resource:${route.resource}`;
}

/**
 * A parent and the parents above it, from the top: the chain stops at a page or a resource that
 * doesn't exist, that the user can't view, that no link leads to (the home page, a page with
 * `params`), or that it already went through.
 */
function chain(definition: Definition, start: ParentRoute | null): ParentRoute[] {
    const parents: ParentRoute[] = [];
    const seen = new Set<string>();
    let current = start;
    while (current !== null && !seen.has(key(current))) {
        seen.add(key(current));
        if (current.name === 'page') {
            const page = definition.pages?.[current.page];
            if (
                page === undefined ||
                current.page === HOME_PAGE ||
                (page.params ?? []).length > 0 ||
                !canViewPage(page)
            ) {
                break;
            }
            parents.unshift(current);
            current = parentOfPage(page.parent);
        } else {
            const resource = findResource(definition, current.resource);
            if (resource === undefined || !resolveResource(resource).abilities.viewAny) {
                break;
            }
            parents.unshift(current);
            current =
                resource.parent !== undefined ? { name: 'page', page: resource.parent } : null;
        }
    }
    return parents;
}

function parentOfPage(parent: string | { resource: string } | undefined): ParentRoute | null {
    if (parent === undefined) {
        return null;
    }
    return typeof parent === 'string'
        ? { name: 'page', page: parent }
        : { name: 'resource.index', resource: parent.resource };
}

/**
 * The parents of a route, from the top (decision 0093): those of the list of a resource for its
 * items, its new items and the page that chooses their type, then the list; the `parent` of a
 * resource's list or of a page, and its own parents. The show route is the list with the item's
 * panel: its parents are the list's. The home page, the account page and others have none.
 */
export function getRouteParents(definition: Definition, route: AppRoute): ParentRoute[] {
    switch (route.name) {
        case 'resource.index':
        case 'resource.show': {
            const resource = findResource(definition, route.resource);
            return resource?.parent !== undefined
                ? chain(definition, { name: 'page', page: resource.parent })
                : [];
        }
        case 'resource.create':
        case 'resource.edit':
            return chain(definition, { name: 'resource.index', resource: route.resource });
        case 'page':
            return chain(definition, parentOfPage(definition.pages?.[route.page]?.parent));
        default:
            return [];
    }
}

/** The parents of a route as links, from the top: the label of a page, a resource's plural. */
export function getPageParents(
    definition: Definition,
    basePath: string,
    route: AppRoute,
): PageParent[] {
    return getRouteParents(definition, route).map((parent) => {
        if (parent.name === 'page') {
            return {
                href: routePath(parent, basePath),
                label: definition.pages?.[parent.page]?.label ?? parent.page,
            };
        }
        const resource = findResource(definition, parent.resource);
        return {
            href: routePath(parent, basePath),
            label: capitalize(resource?.label.plural ?? parent.resource, definition.locale),
        };
    });
}

/**
 * The route that the menus show as current: the route itself when one of their links leads to it,
 * else its nearest parent that one leads to (decision 0093), such as the dashboard page of a log
 * that isn't in the menus.
 */
export function getMenuRoute(
    definition: Definition,
    entries: readonly NavEntry[],
    route: AppRoute,
): AppRoute {
    const links = entries.flatMap((entry) =>
        entry.type === 'link' ? [entry] : entry.type === 'group' ? entry.children : [],
    );
    const candidates: AppRoute[] = [route, ...getRouteParents(definition, route).reverse()];
    return (
        candidates.find((candidate) => links.some((link) => isCurrent(link.target, candidate))) ??
        route
    );
}
