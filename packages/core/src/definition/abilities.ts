import type { Abilities, Action, ActionPlacement, Item } from '@panneau/protocol';
import {
    ITEM_ACTION_ABILITIES,
    isBuiltInItemAction,
    isBuiltInLink,
} from '@panneau/protocol/runtime';

/**
 * Whether a set of abilities allows something. Without abilities (a backend that sends none),
 * everything is allowed and the backend decides. With abilities, only what is `true` is allowed.
 */
export function can(abilities: Abilities | undefined, ability: string): boolean {
    return abilities === undefined || abilities[ability] === true;
}

/** Whether the current user can run an action on the resource (`abilities.run`). */
export function canRunAction(action: Action): boolean {
    return action.abilities?.run !== false;
}

/**
 * Whether an action is available on an item: the user can run it, and the item allows it.
 * - The built-in item actions need their ability (decision 0040): `view` for `show`, `update` for
 *   `edit`, `duplicate` and `delete`. A missing or false ability hides them.
 * - Other links are allowed unless the item says otherwise (`"site": false`).
 * - Other actions need their id in the abilities of the item (`"publish": true`).
 */
export function isActionAllowedOn(action: Action, item: Pick<Item, 'abilities'>): boolean {
    if (!canRunAction(action)) {
        return false;
    }
    if (isBuiltInItemAction(action.id)) {
        return (
            item.abilities[ITEM_ACTION_ABILITIES[action.id]] === true &&
            item.abilities[action.id] !== false
        );
    }
    if (action.kind === 'link') {
        return item.abilities[action.id] !== false;
    }
    return item.abilities[action.id] === true;
}

/** Splits the items of a selection by whether an action is allowed on them. */
export function partitionByAction(
    action: Action,
    items: readonly Item[],
): { allowed: Item[]; skipped: Item[] } {
    const allowed: Item[] = [];
    const skipped: Item[] = [];
    items.forEach((item) => (isActionAllowedOn(action, item) ? allowed : skipped).push(item));
    return { allowed, skipped };
}

/**
 * Where an action appears when it doesn't say: rows and forms for items, the toolbar otherwise.
 * The built-in links `show` and `edit` that the client resolves (without a `url` or a `route`)
 * are in rows only.
 */
export function getActionPlacements(action: Action): ActionPlacement[] {
    if (action.placement !== undefined) {
        return action.placement;
    }
    if (
        action.kind === 'link' &&
        isBuiltInLink(action.id) &&
        action.url === undefined &&
        action.route === undefined
    ) {
        return ['row'];
    }
    const placements = new Set<ActionPlacement>();
    action.scope.forEach((scope) => {
        if (scope === 'item') {
            placements.add('row');
            placements.add('form');
        } else {
            placements.add('toolbar');
        }
    });
    return [...placements];
}
