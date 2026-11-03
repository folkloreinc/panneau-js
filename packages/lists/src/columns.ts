import type { ListColumn } from './types';

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
