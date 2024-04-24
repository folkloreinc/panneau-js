/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@panneau/element-button';

import MediasBrowser from './MediasBrowser';
import { useMediasForm } from './MediasFormContext';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    items: PropTypes.arrayOf(PropTypes.shape({})),
    value: PropTypes.arrayOf(PropTypes.shape({})),
    onSelectionChange: PropTypes.func,
    multipleSelection: PropTypes.bool,
    types: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    withoutButtons: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    items: null,
    value: null,
    onSelectionChange: null,
    multipleSelection: false,
    types: null,
    onClose: null,
    withoutButtons: false,
    className: null,
};

function MediasPicker({
    items: initialItems,
    value: initialSelectedItems,
    onSelectionChange: parentOnSelectionChange,
    multipleSelection,
    types,
    onChange,
    onClose,
    withoutButtons,
    className,
    ...props
}) {
    const { media: currentMedia } = useMediasForm();

    // For selection
    const [pageItems, setItems] = useState(initialItems);
    const disabled = pageItems === null || pageItems.length < 1;

    const onItemsChange = useCallback(
        (newPageItems) => {
            setItems(newPageItems);
        },
        [setItems],
    );

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
        if (parentOnSelectionChange !== null) {
            parentOnSelectionChange(selectedItems);
        }
    }, [selectedItems, parentOnSelectionChange]);

    const onConfirmSelection = useCallback(() => {
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
                multipleSelection={multipleSelection}
                onItemsChange={onItemsChange}
                types={types}
                // extraItems={
                //     !multiple && initialSelectedItems !== null
                //         ? [initialSelectedItems]
                //         : initialSelectedItems
                // }
                {...props}
            />
            {!withoutButtons && currentMedia === null ? (
                <div className="d-flex w-100 align-items-end justify-content-end mt-3">
                    <div className="btn-group">
                        {onClose !== null ? (
                            <Button
                                type="button"
                                theme="secondary"
                                onClick={onClose}
                                className="d-block me-2"
                            >
                                <FormattedMessage
                                    defaultMessage="Cancel"
                                    description="Button label"
                                />
                            </Button>
                        ) : null}
                        <Button
                            type="button"
                            theme="primary"
                            onClick={onConfirmSelection}
                            disabled={disabled}
                            outline={disabled}
                            className="d-block"
                        >
                            <FormattedMessage
                                defaultMessage="Confirm selection"
                                description="Button label"
                            />
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

MediasPicker.propTypes = propTypes;
MediasPicker.defaultProps = defaultProps;

export default MediasPicker;
