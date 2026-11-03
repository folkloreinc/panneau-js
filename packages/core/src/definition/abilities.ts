import type { Abilities, Action, ActionPlacement, Field, Item, Page } from '@panneau/protocol';
import { ITEM_ACTION_ABILITIES, isBuiltInItemAction } from '@panneau/protocol/runtime';

/**
 * Whether a set of abilities allows something. Without abilities (a backend that sends none),
 * everything is allowed and the backend decides. With abilities, only what is `true` is allowed.
 */
export function can(abilities: Abilities | undefined, ability: string): boolean {
    return abilities === undefined || abilities[ability] === true;
}

/**
 * Whether the current user can see a field (decision 0042): unless its `abilities.view` is
 * `false`. A hidden field is left out of forms, details and lists.
 */
export function canViewField(field: Pick<Field, 'abilities'>): boolean {
    return field.abilities?.view !== false;
}

/**
 * Whether the current user can edit a field (decision 0042): they can see it, and its
 * `abilities.update` isn't `false`. A field they can't edit is read-only.
 */
export function canUpdateField(field: Pick<Field, 'abilities'>): boolean {
    return canViewField(field) && field.abilities?.update !== false;
}

/** The fields the current user can see, in their order. */
export function getVisibleFields<T extends Pick<Field, 'abilities'>>(fields: readonly T[]): T[] {
    return fields.filter(canViewField);
}

/**
 * Whether the current user can open a page of the definition (decision 0042): unless its
 * `abilities.view` is `false`.
 */
export function canViewPage(page: Pick<Page, 'abilities'>): boolean {
    return page.abilities?.view !== false;
}

/** Whether the current user can run an action on the resource (`abilities.run`). */
export function canRunAction(action: Action): boolean {
    return action.abilities?.run !== false;
}

/**
 * Whether an action is available on an item: the user can run it, and the item allows it.
 * - The built-in item actions need their ability (decision 0040): `view` for `show`, `update` for
 *   `edit`, `duplicate` and `delete`. A missing or false ability hides them, and so does their
 *   own id set to `false` (`"edit": false`). An item without abilities shows none of them.
 * - Other links are allowed unless the item says otherwise (`"site": false`).
 * - Other actions need their id in the abilities of the item (`"publish": true`).
 * - On an item without abilities (a product's own records), other actions are allowed: the
 *   backend decides.
 */
export function isActionAllowedOn(
    action: Action,
    item: { readonly abilities?: Abilities | undefined },
): boolean {
    if (!canRunAction(action)) {
        return false;
    }
    const { abilities } = item;
    if (isBuiltInItemAction(action.id)) {
        return (
            abilities?.[ITEM_ACTION_ABILITIES[action.id]] === true && abilities[action.id] !== false
        );
    }
    if (abilities === undefined) {
        return true;
    }
    if (action.kind === 'link') {
        return abilities[action.id] !== false;
    }
    return abilities[action.id] === true;
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
 * Where an action appears when it doesn't say: rows and forms (the header of an item, in its
 * panel and its form) for items, the toolbar otherwise.
 */
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
