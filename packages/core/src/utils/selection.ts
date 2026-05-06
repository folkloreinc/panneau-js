import type { Item } from '../types';

export function toggleSelectedItem(
    items: Item[] | null,
    item: Item,
    { multiple: multipleSelection = false }: { multiple?: boolean } = {},
): Item[] | null {
    const { id: itemId = null } = item || {};
    const currentItem = (items || []).find(({ id }) => id === itemId) || null;

    if (currentItem !== null) {
        return items.filter(({ id }) => id !== itemId);
    }

    return multipleSelection ? [...(items || []), item] : [item];
}

export function selectItems(items: Item[] | null, itemsToSelect: Item[]): Item[] | null {
    const newItems = itemsToSelect.filter((item) => {
        const { id: itemId = null } = item || {};
        const currentItem = (items || []).find(({ id }) => id === itemId) || null;
        return currentItem === null;
    });
    return newItems.length > 0 ? [...(items || []), ...newItems] : items;
}

export function unselectItems(items: Item[] | null, itemsToUnselect: Item[]): Item[] | null {
    const newItems = (items || []).filter((item) => {
        const { id: itemId = null } = item || {};
        const currentItem = itemsToUnselect.find(({ id }) => id === itemId) || null;
        return currentItem === null;
    });
    return items !== null && newItems.length !== items.length ? newItems : items;
}
