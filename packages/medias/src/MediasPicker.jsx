/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import MediasBrowser from './MediasBrowser';

const propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({})),
    value: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.arrayOf(PropTypes.shape({}))]),
    multiple: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    items: null,
    value: null,
    multiple: false,
    className: null,
};

function MediasPicker({
    items: initialItems,
    value: initialSelectedItems,
    onChange,
    multiple,
    className,
    ...props
}) {
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
                {...props}
            />
        </div>
    );
}

MediasPicker.propTypes = propTypes;
MediasPicker.defaultProps = defaultProps;

export default MediasPicker;
