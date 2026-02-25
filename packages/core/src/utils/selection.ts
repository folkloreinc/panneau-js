import isArray from 'lodash/isArray';
import uniqBy from 'lodash/uniqBy';

import type { Item } from '../types';

function filterNullItems<T>(items: T[] | T | null): T[] | T | null {
    return isArray(items) ? items.filter((it) => it !== null) : items;
}

function getItemsArray(items: Item | Item[] | null): Item[] {
    return (items !== null && isArray(items) ? items.filter((it) => it !== null) : [items]).filter(
        (it): it is Item => it !== null,
    );
}

export function selectItem(
    item: Item,
    selectedItems: Item | Item[] | null,
    onSelectionChange: ((value: Item | Item[] | null) => void) | null,
    multipleSelection: boolean = false,
): void {
    const { id: itemId = null } = item || {};
    const selectedItemsArray = getItemsArray(selectedItems);
    const oldItem = selectedItemsArray.find(({ id }) => id === itemId) || null;

    let newItems: Item[] = [];
    if (oldItem === null) {
        newItems =
            selectedItems !== null && multipleSelection ? [...selectedItemsArray, item] : [item];
    } else {
        newItems = selectedItemsArray.filter(({ id }) => id !== itemId);
    }

    if (onSelectionChange !== null) {
        const [firstItem = null] = newItems || [];
        const value = multipleSelection ? filterNullItems(newItems) : firstItem;
        onSelectionChange(value);
    }
}

export function selectPage(
    pageSelected: boolean,
    items: Item[] | null,
    selectedItems: Item[] | null,
    onSelectionChange: ((value: Item[]) => void) | null,
): void {
    let nextItems: Item[] = [];
    if (!pageSelected) {
        nextItems = uniqBy(
            [...(items || []), ...(selectedItems || [])],
            ({ id = null }: Partial<Item> = {}) => id,
        );
    } else {
        const ids = (items || [])
            .map(({ id = null }: Partial<Item> = {}) => id)
            .filter((id): id is string => id !== null);
        nextItems = uniqBy(
            (selectedItems || []).filter((it) => {
                const { id = null } = it || {};
                return ids.indexOf(id) === -1;
            }),
            ({ id = null }: Partial<Item> = {}) => id,
        );
    }
    const finalNextItems = nextItems;
    if (onSelectionChange !== null) {
        onSelectionChange(finalNextItems);
    }
}
