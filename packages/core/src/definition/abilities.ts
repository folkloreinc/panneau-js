import type { Abilities, Action, ActionPlacement, Item } from '@panneau/protocol';
import { isBuiltInLink } from '@panneau/protocol/runtime';

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

/** The ability of an item that the built-in links need (decision 0040). */
const LINK_ABILITIES: Readonly<Record<string, string>> = { edit: 'update', show: 'view' };

/**
 * Whether an action is available on an item: the user can run it, and the item lists its id in
 * its abilities. Links are allowed unless the item says otherwise: `edit` is hidden on an item
 * that can't be updated (`update: false`), and `show` on one that can't be viewed (`view: false`).
 */
export function isActionAllowedOn(action: Action, item: Pick<Item, 'abilities'>): boolean {
    if (!canRunAction(action)) {
        return false;
    }
    if (action.kind === 'link') {
        const needs = isBuiltInLink(action.id) ? LINK_ABILITIES[action.id] : undefined;
        return (
            item.abilities[action.id] !== false &&
            (needs === undefined || item.abilities[needs] !== false)
        );
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
 * The built-in links `show` and `edit` are in rows only.
 */
export function getActionPlacements(action: Action): ActionPlacement[] {
    if (action.placement !== undefined) {
        return action.placement;
    }
    if (action.kind === 'link' && isBuiltInLink(action.id)) {
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
