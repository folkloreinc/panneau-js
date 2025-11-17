/* eslint-disable react/jsx-props-no-spreading */
import isArray from 'lodash-es/isArray';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import MediasBrowser from './MediasBrowser';

const propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({})),
    value: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.arrayOf(PropTypes.shape({}))]),
    multiple: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

function MediasPicker({
    items: initialItems = null,
    value: initialSelectedItems = null,
    onChange,
    multiple = false,
    className = null,
    ...props
})  {
    // Keep the previous selection on top of first page
    const extraItems = useMemo(() => {
        if (initialSelectedItems === null) {
            return null;
        }
        return isArray(initialSelectedItems) ? initialSelectedItems : [initialSelectedItems];
    }, []);

    // Mostly for testing
    const [selectedItems, setSelectedItems] = useState(initialSelectedItems || null);
    const onSelectionChange = useCallback(
        (newSelection) => {
            setSelectedItems(newSelection);
        },
        [setSelectedItems],
    );

    // Sync from the top
    useEffect(() => {
        setSelectedItems(initialSelectedItems);
    }, [initialSelectedItems, setSelectedItems]);

    useEffect(() => {
        if (onChange !== null) {
            onChange(selectedItems);
        }
    }, [selectedItems, onChange]);

    return (
        <div className={className}>
            <MediasBrowser
                items={initialItems} // TODO: fix useItems if actually using this
                selectable
                selectedItems={selectedItems}
                onSelectionChange={onSelectionChange}
                multipleSelection={multiple}
                extraItems={extraItems}
                {...props}
            />
        </div>
    );
}

MediasPicker.propTypes = propTypes;

export default MediasPicker;
