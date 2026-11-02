import type { Abilities, Action, ActionPlacement, Resource } from '@panneau/protocol';
import { isBuiltInLink } from '@panneau/protocol/runtime';

import { isActionAllowedOn } from './abilities';
import { getResourceActions, groupActions } from './list';

/**
 * Where an item's actions are shown (decision 0040): the buttons of its row in a list, the
 * overflow menu of its row, the header of its panel (the show route), the header of its form.
 */
export type ItemSurface = 'row' | 'menu' | 'panel' | 'form';

/** An item as its actions need it: its id, its abilities, and its values for URL templates. */
export interface ActionItem {
    id: string;
    /**
     * What the user can do with the item. Without abilities, the built-in item actions are hidden,
     * and the other actions are allowed: the backend decides.
     */
    abilities?: Abilities | undefined;
    [key: string]: unknown;
}

/** An action of an item, ready to show: a link, or an action to run. */
export interface ItemAction {
    action: Action;
    /** The link of a `link` action, or `null` for an action that runs (with the action runner). */
    href: string | null;
}

export interface ItemActionsOptions {
    /**
     * The link of a `link` action without a `url`: the built-in `show` and `edit`, and actions
     * with a `route`, which the caller resolves to its routes. A built-in link it doesn't resolve
     * is left out; an action with a `route` then runs, and the action runner navigates.
     */
    getLinkHref?: ((action: Action, item: ActionItem) => string | null) | undefined;
    /** Leaves out the actions the caller can't run, such as `duplicate` without an adapter for it. */
    filter?: ((action: Action) => boolean) | undefined;
}

/** The placement of the actions of each surface: the panel and the form share the item's header. */
const SURFACE_PLACEMENTS: Readonly<Record<ItemSurface, ActionPlacement>> = {
    row: 'row',
    menu: 'menu',
    panel: 'form',
    form: 'form',
};

/** The action that leads to a surface, which isn't shown on it. */
const SELF_ACTIONS: Readonly<Partial<Record<ItemSurface, string>>> = {
    panel: 'show',
    form: 'edit',
};

/**
 * The URL template of a `link` action with the values of an item: `{id}`, and other `{field}`
 * with a string or a number. `null` without a `url`.
 */
export function fillActionUrl(action: Action, item?: ActionItem): string | null {
    if (action.kind !== 'link' || action.url === undefined) {
        return null;
    }
    return action.url.replace(/\{([^}]+)\}/g, (match, name: string) => {
        const value = item?.[name];
        return typeof value === 'string' || typeof value === 'number'
            ? encodeURIComponent(String(value))
            : match;
    });
}

/**
 * The actions of an item on a surface, from actions already placed there (a group of
 * `resolveList()`'s actions): those that apply to items, that the user can run and that the item
 * allows, without the one that leads to the surface, each with its link. `getItemActions()` is
 * this function for a resource; lists use it with the actions they are given.
 */
export function selectItemActions(
    actions: readonly Action[],
    item: ActionItem,
    surface: ItemSurface,
    { getLinkHref, filter }: ItemActionsOptions = {},
): ItemAction[] {
    return actions.flatMap((action): ItemAction[] => {
        const allowed = isActionAllowedOn(action, item);
        if (
            !action.scope.includes('item') ||
            action.id === SELF_ACTIONS[surface] ||
            !allowed ||
            (filter !== undefined && !filter(action))
        ) {
            return [];
        }
        if (action.kind !== 'link') {
            return [{ action, href: null }];
        }
        const href = fillActionUrl(action, item) ?? getLinkHref?.(action, item) ?? null;
        if (href === null && action.route === undefined && isBuiltInLink(action.id)) {
            // A built-in link that nothing resolves goes nowhere
            return [];
        }
        return [{ action, href }];
    });
}

/**
 * The actions of an item on a surface (decision 0040), in their order: the built-in item actions
 * of the resource that the item's abilities allow, then its declared actions, by their placement
 * and the item's abilities. Rows, their menu, the panel and the form show the same actions for
 * the same item, but for the one that leads to the surface: no `show` in the panel, no `edit` in
 * the form. The panel and the form show the actions placed in `form`.
 */
export function getItemActions(
    resource: Resource,
    item: ActionItem,
    surface: ItemSurface,
    options: ItemActionsOptions = {},
): ItemAction[] {
    const placed = groupActions(getResourceActions(resource))[SURFACE_PLACEMENTS[surface]];
    return selectItemActions(placed, item, surface, options);
}
