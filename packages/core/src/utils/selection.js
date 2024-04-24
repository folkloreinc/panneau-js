import isArray from 'lodash/isArray';
import uniqBy from 'lodash/uniqBy';

function filterNullItems(items) {
    return isArray(items) ? items.filter((it) => it !== null) : items;
}

function getItemsArray(items) {
    return (items !== null && isArray(items) ? items.filter((it) => it !== null) : [items]).filter(
        (it) => it !== null,
    );
}

export function selectItem(item, selectedItems, onSelectionChange, multipleSelection = false) {
    const { id: itemId = null } = item || {};
    const selectedItemsArray = getItemsArray(selectedItems);
    const oldItem = selectedItemsArray.find(({ id }) => id === itemId) || null;

    let newItems = [];
    if (oldItem === null) {
        newItems =
            selectedItems !== null && multipleSelection ? [...selectedItemsArray, item] : [item];
    } else {
        newItems = selectedItemsArray.filter(({ id }) => id !== itemId);
    }

    if (onSelectionChange !== null) {
        const [firstItem = null] = newItems || [];
        onSelectionChange(multipleSelection ? filterNullItems(newItems) : firstItem);
    }
}

export function selectPage(pageSelected, items, selectedItems, onSelectionChange) {
    let nextItems = [];
    if (!pageSelected) {
        nextItems = uniqBy(
            [...(items || []), ...(selectedItems || [])],
            ({ id = null } = {}) => id,
        );
    } else {
        const ids = (items || []).map(({ id = null } = {}) => id).filter((id) => id !== null);
        nextItems = uniqBy(
            (selectedItems || []).filter((it) => {
                const { id = null } = it || {};
                return ids.indexOf(id) === -1;
            }),
            ({ id = null } = {}) => id,
        );
    }
    const finalNextItems = nextItems;
    if (onSelectionChange !== null) {
        onSelectionChange(finalNextItems);
    }
}
