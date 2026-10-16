import type { ListSelection } from '@panneau/core';

import type { ListItem } from './types';

// The selection is read from the subscribed state, not through the methods of the list
// (`list.isSelected()`): under the React Compiler, a component that calls a method of an object
// that doesn't change would keep its first result.

/** Whether an item is selected. */
export function isItemSelected(selection: ListSelection, id: string): boolean {
    return selection.mode === 'all' ? !selection.except.includes(id) : selection.ids.includes(id);
}

/** How many items are selected, given the total of the list (or the count of items without it). */
export function countSelected(selection: ListSelection, total: number): number {
    return selection.mode === 'all'
        ? Math.max(0, total - selection.except.length)
        : selection.ids.length;
}

/** Whether every, some or none of the items of a page are selected. */
export function getPageSelection(
    selection: ListSelection,
    items: readonly ListItem[],
): 'all' | 'some' | 'none' {
    const selected = items.filter((item) => isItemSelected(selection, item.id)).length;
    if (selected === 0 || items.length === 0) {
        return 'none';
    }
    return selected === items.length ? 'all' : 'some';
}
