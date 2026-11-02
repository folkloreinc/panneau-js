import { getOpenMode } from '@panneau/core';
import type { Abilities, Action, Resource } from '@panneau/protocol';

import { routePath } from '../routes';

/**
 * Whether an item opens in its form (`"open": "edit"` of its resource, decision 0040). An item
 * that can't be updated (without `abilities.update: true`) still opens in the panel of its details.
 */
export function opensInForm(resource: Resource, abilities: Abilities | undefined): boolean {
    return getOpenMode(resource) === 'edit' && abilities?.update === true;
}

/**
 * Where an item's title goes: its edit form, or the show route, with the list's query string
 * (`search`), which opens its details in a panel next to the list.
 */
export function getItemPath(
    resource: Resource,
    item: { id: string; abilities?: Abilities | undefined },
    basePath: string,
    search = '',
): string {
    return opensInForm(resource, item.abilities)
        ? routePath({ name: 'resource.edit', resource: resource.id, id: item.id }, basePath)
        : `${routePath({ name: 'resource.show', resource: resource.id, id: item.id }, basePath)}${search}`;
}

/**
 * The link of a built-in `show` or `edit` action without a `url` or a `route`: the routes of the
 * app. `show` goes where the item's title goes.
 */
export function getBuiltInLinkPath(
    resource: Resource,
    action: Action,
    item: { id: string; abilities?: Abilities | undefined },
    basePath: string,
    search = '',
): string | null {
    if (action.id === 'edit') {
        return routePath({ name: 'resource.edit', resource: resource.id, id: item.id }, basePath);
    }
    if (action.id === 'show') {
        return getItemPath(resource, item, basePath, search);
    }
    return null;
}
