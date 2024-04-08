import isArray from 'lodash/isArray';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useMemo, useState } from 'react';

const useItemSelection = ({
    items = null,
    selectedItems: initialSelectedItems = null,
    multipleSelection = false,
    onSelectionChange = null,
}) => {
    const initialItems =
        !isArray(initialSelectedItems) && initialSelectedItems !== null
            ? [initialSelectedItems]
            : initialSelectedItems;
    const [selectedItems, setSelectedItems] = useState(initialItems);

    const onSelectItem = useCallback(
        (item, index) => {
            const { id: itemId = null } = item || {};
            const oldItem = (selectedItems || []).find(({ id }) => id === itemId) || null;

            let newItems = [];
            if (oldItem === null) {
                newItems =
                    selectedItems !== null && multipleSelection ? [...selectedItems, item] : [item];
            } else {
                newItems = (selectedItems || []).filter(({ id }) => id !== itemId);
            }
            setSelectedItems(newItems);
            if (onSelectionChange !== null) {
                const [firstItem = null] = newItems || [];
                const finalValue = multipleSelection ? newItems : firstItem;
                onSelectionChange(finalValue, item, index);
            }
        },
        [selectedItems, onSelectionChange, multipleSelection],
    );

    const onSelectPage = useCallback(
        (pageSelected = false) => {
            let nextItems = [];
            if (!pageSelected) {
                nextItems = uniqBy(
                    [...(items || []), ...(selectedItems || [])],
                    ({ id = null } = {}) => id,
                );
            } else {
                const ids = (items || [])
                    .map(({ id = null } = {}) => id)
                    .filter((id) => id !== null);
                nextItems = uniqBy(
                    (selectedItems || []).filter((it) => {
                        const { id = null } = it || {};
                        return ids.indexOf(id) === -1;
                    }),
                    ({ id = null } = {}) => id,
                );
            }

            setSelectedItems(nextItems);
            if (onSelectionChange !== null) {
                onSelectionChange(nextItems);
            }
        },
        [items, selectedItems, setSelectedItems, onSelectionChange],
    );

    const onClearSelected = useCallback(() => {
        setSelectedItems([]);
        if (onSelectionChange !== null) {
            onSelectionChange(multipleSelection ? [] : null);
        }
    }, [setSelectedItems, onSelectionChange, multipleSelection]);

    useEffect(() => {
        setSelectedItems(initialSelectedItems);
    }, [initialSelectedItems]);

    const pageSelected = useMemo(() => {
        if (items === null || selectedItems === null) {
            return false;
        }
        const ids = (items || []).map(({ id = null } = {}) => id).filter((id) => id !== null) || [];
        if (ids === null || ids.length === 0) {
            return false;
        }
        const currentPageItems =
            (selectedItems || []).filter((it) => {
                const { id = null } = it || {};
                return (ids || []).indexOf(id) !== -1;
            }) || [];
        return currentPageItems.length > 0 && currentPageItems.length === (items || []).length;
    }, [selectedItems, items]);

    const allSelected = useMemo(
        () => selectedItems !== null && items !== null && selectedItems.length === items.length,
        [selectedItems, items],
    );

    const selectedCount = useMemo(
        () => (selectedItems !== null && selectedItems.length > 0 ? selectedItems.length : null),
        [selectedItems],
    );

    return {
        onSelectItem,
        onSelectPage,
        onClearSelected,
        pageSelected,
        allSelected,
        selectedCount,
        selectedItems,
        setSelectedItems,
    };
};

export default useItemSelection;
