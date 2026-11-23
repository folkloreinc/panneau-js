import type { ReactNode } from 'react';

import { humanizeKey } from '@panneau/protocol/runtime';

import type { ListColumn } from './types';

/**
 * The label of a column: its `label` as given, an empty one included, or its id made readable
 * (`published_at` → "Published at", issue 408).
 */
export function getColumnLabel(column: ListColumn): ReactNode {
    return column.label ?? humanizeKey(column.id);
}

/** The label of a column as text, for options and menus: a label that isn't text reads its id. */
export function getColumnText(column: ListColumn): string {
    return typeof column.label === 'string' ? column.label : humanizeKey(column.id);
}

function isHideable(column: ListColumn): boolean {
    return column.hideable !== false;
}

/** The columns shown by default: those that aren't hidden (decision 0042). */
export function getDefaultColumns<T extends ListColumn>(columns: readonly T[]): T[] {
    return columns.filter((column) => column.hidden !== true || !isHideable(column));
}

/**
 * The columns shown, in their order: those of `ids` (the view of the list), or the defaults
 * without it. Ids of columns that don't exist are ignored, and columns that can't be hidden are
 * added where the definition has them.
 */
export function getShownColumns<T extends ListColumn>(
    columns: readonly T[],
    ids: readonly string[] | undefined,
): T[] {
    if (ids === undefined) {
        return getDefaultColumns(columns);
    }
    const shown = ids
        .filter((id, index) => ids.indexOf(id) === index)
        .map((id) => columns.find((column) => column.id === id))
        .filter((column): column is T => column !== undefined);
    columns.forEach((column, index) => {
        if (!isHideable(column) && !shown.includes(column)) {
            shown.splice(Math.min(index, shown.length), 0, column);
        }
    });
    return shown.length > 0 ? shown : getDefaultColumns(columns);
}
