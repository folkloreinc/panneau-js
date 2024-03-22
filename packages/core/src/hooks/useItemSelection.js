import isArray from 'lodash/isArray';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useMemo, useState } from 'react';

const useItemSelection = ({
    items = null,
    selectedItems: initialSelectedItems = null,
    multiple = false,
    onSelectionChange = null,
}) => {
    const initialItems =
        !isArray(initialSelectedItems) && initialSelectedItems !== null
            ? [initialSelectedItems]
            : initialSelectedItems;
    const [selectedItems, setSelectedItems] = useState(initialItems);

    const onSelectItem = useCallback(
        (item, index) => {
            const newItems = selectedItems !== null && multiple ? [...selectedItems, item] : [item];
            setSelectedItems(newItems);
            if (onSelectionChange !== null) {
                onSelectionChange(newItems, item, index);
            }
        },
        [selectedItems, onSelectionChange, multiple],
    );

    const onDeselectItem = useCallback(
        (item, index) => {
            const { id: itemId = null } = item || {};
            const newItems = (selectedItems || []).filter(({ id }) => id !== itemId);
            setSelectedItems(newItems);
            if (onSelectionChange !== null) {
                onSelectionChange(multiple ? newItems : null, item, index);
            }
        },
        [selectedItems, onSelectionChange, multiple],
    );

    const onSelectPage = useCallback(() => {
        const nextItems = uniqBy(
            [...(items || []), ...(selectedItems || [])],
            ({ id = null } = {}) => id,
        );
        setSelectedItems(nextItems);
        if (onSelectionChange !== null) {
            onSelectionChange(nextItems);
        }
    }, [items, selectedItems, setSelectedItems, onSelectionChange]);

    const onDeselectPage = useCallback(() => {
        const ids = (items || []).map(({ id = null } = {}) => id).filter((id) => id !== null);
        const nextItems = uniqBy(
            (selectedItems || []).filter((it) => {
                const { id = null } = it || {};
                return ids.indexOf(id) === -1;
            }),
            ({ id = null } = {}) => id,
        );

        setSelectedItems(nextItems);
        if (onSelectionChange !== null) {
            onSelectionChange(nextItems);
        }
    }, [items, selectedItems, setSelectedItems, onSelectionChange]);

    const onClearAll = useCallback(() => {
        setSelectedItems([]);
        if (onSelectionChange !== null) {
            onSelectionChange([]);
        }
    }, [setSelectedItems, onSelectionChange]);

    useEffect(() => {
        setSelectedItems(initialSelectedItems);
    }, [initialSelectedItems]);

    const pageSelected = useMemo(() => {
        const ids = (items || []).map(({ id = null } = {}) => id).filter((id) => id !== null);
        const currentPageItems = (selectedItems || []).filter((it) => {
            const { id = null } = it || {};
            return ids.indexOf(id) !== -1;
        });
        return currentPageItems.length === (items || []).length && currentPageItems.length > 0;
    }, [selectedItems, items]);

    const allSelected = useMemo(
        () => selectedItems !== null && items !== null && selectedItems.length === items.length,
        [selectedItems, items],
    );

    const countSelected = useMemo(
        () => (selectedItems !== null && selectedItems.length > 0 ? selectedItems.length : null),
        [selectedItems],
    );

    return {
        onSelectItem,
        onDeselectItem,
        onSelectPage,
        onDeselectPage,
        onClearAll,
        pageSelected,
        allSelected,
        count: countSelected,
        selectedItems,
    };
};

export default useItemSelection;
