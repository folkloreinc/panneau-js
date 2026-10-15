import type { Abilities, Action, ActionPlacement, Item } from '@panneau/protocol';

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
 * Whether an action is available on an item: the user can run it, and the item lists its id in
 * its abilities. Links to show and edit are allowed unless the item says otherwise.
 */
export function isActionAllowedOn(action: Action, item: Item): boolean {
    if (!canRunAction(action)) {
        return false;
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

/** Where an action appears when it doesn't say: rows and forms for items, the toolbar otherwise. */
export function getActionPlacements(action: Action): ActionPlacement[] {
    if (action.placement !== undefined) {
        return action.placement;
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
