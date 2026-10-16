import { canRunAction, groupActions } from '@panneau/core';
import type { Action, ActionPlacement } from '@panneau/protocol';

import type { ListItem } from '../types';

/** Actions of a list: a list (grouped by their placements), or already grouped by placement. */
export type ListActions = readonly Action[] | Partial<Record<ActionPlacement, readonly Action[]>>;

/**
 * Groups actions by placement, without those the user can't run on the resource
 * (`abilities.run`). Actions already grouped (as `resolveList()` does) are filtered the same way.
 */
export function groupListActions(
    actions: ListActions | undefined,
): Record<ActionPlacement, Action[]> {
    if (actions === undefined) {
        return { row: [], toolbar: [], form: [], menu: [] };
    }
    if (isActionList(actions)) {
        return groupActions(actions);
    }
    const pick = (placement: ActionPlacement) => (actions[placement] ?? []).filter(canRunAction);
    return { row: pick('row'), toolbar: pick('toolbar'), form: pick('form'), menu: pick('menu') };
}

function isActionList(actions: ListActions): actions is readonly Action[] {
    return Array.isArray(actions);
}

/**
 * Whether an action is available on an item (decision 0011). Without abilities, the item allows
 * everything and the backend decides. With abilities, a link is allowed unless the item says
 * otherwise, and other actions only when the item lists their id.
 */
export function isAllowedOn(action: Action, item: ListItem): boolean {
    if (!canRunAction(action)) {
        return false;
    }
    if (item.abilities === undefined) {
        return true;
    }
    if (action.kind === 'link') {
        return item.abilities[action.id] !== false;
    }
    return item.abilities[action.id] === true;
}

/**
 * The link of a `link` action for an item: its `url` template with `{id}` (and other `{field}`
 * values of the item) filled in, or `null` for an action with a `route` or without an item.
 */
export function getActionHref(action: Action, item?: ListItem): string | null {
    if (action.kind !== 'link' || action.url === undefined) {
        return null;
    }
    const { url } = action;
    return url.replace(/\{([^}]+)\}/g, (match, name: string) => {
        const value = item?.[name];
        return typeof value === 'string' || typeof value === 'number'
            ? encodeURIComponent(String(value))
            : match;
    });
}

/** Whether an action's scope includes another one. */
export function hasScope(action: Action, scope: Action['scope'][number]): boolean {
    return action.scope.includes(scope);
}
