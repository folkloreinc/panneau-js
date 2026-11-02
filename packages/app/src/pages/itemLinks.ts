import { getOpenMode } from '@panneau/core';
import type { Action, Resource } from '@panneau/protocol';

import { routePath } from '../routes';

/**
 * Where an item opens (`open` of its resource, decision 0040): the show route, with its details
 * in a panel next to the list, or its edit form.
 */
export function getItemPath(resource: Resource, id: string, basePath: string): string {
    return routePath(
        {
            name: getOpenMode(resource) === 'edit' ? 'resource.edit' : 'resource.show',
            resource: resource.id,
            id,
        },
        basePath,
    );
}

/**
 * The link of a built-in `show` or `edit` action without a `url` or a `route`: the routes of the
 * app. `search`, the list's query string, is kept by `show`, which opens the panel next to the list.
 */
export function getBuiltInLinkPath(
    resource: Resource,
    action: Action,
    id: string,
    basePath: string,
    search = '',
): string | null {
    if (action.id === 'edit') {
        return routePath({ name: 'resource.edit', resource: resource.id, id }, basePath);
    }
    if (action.id === 'show') {
        const path = getItemPath(resource, id, basePath);
        return getOpenMode(resource) === 'edit' ? path : `${path}${search}`;
    }
    return null;
}
