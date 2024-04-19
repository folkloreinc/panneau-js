/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useItemSelection } from '@panneau/core/hooks';
import Button from '@panneau/element-button';

import MediasBrowser from './MediasBrowser';
import { useMediasForm } from './MediasFormContext';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    items: PropTypes.arrayOf(PropTypes.shape({})),
    value: PropTypes.arrayOf(PropTypes.shape({})),
    types: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    multiple: PropTypes.bool,
    withoutButtons: PropTypes.bool,
    tableProps: PropTypes.shape({
        theme: PropTypes.string,
    }),
    className: PropTypes.string,
};

const defaultProps = {
    items: null,
    value: null,
    types: null,
    onClose: null,
    multiple: false,
    withoutButtons: false,
    tableProps: null,
    className: null,
};

function MediasPicker({
    items: initialItems,
    value: initialSelectedItems,
    types,
    onChange,
    onConfirm,
    onClose,
    multiple,
    withoutButtons,
    tableProps,
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

    const {
        onSelectItem,
        onSelectPage,
        onClearSelected,
        pageSelected,
        selectedCount,
        selectedItems,
    } = useItemSelection({
        items: pageItems,
        selectedItems: initialSelectedItems,
        onSelectionChange: onChange,
        multipleSelection: multiple,
    });

    const onConfirmSelection = useCallback(() => {
        if (onConfirm !== null) {
            onConfirm(selectedItems);
        }
    }, [selectedItems, onConfirm]);

    return (
        <div className={className}>
            <MediasBrowser
                tableProps={{
                    selectable: true,
                    multipleSelection: multiple,
                    onSelectItem,
                    onSelectPage,
                    selectedItems,
                    pageSelected,
                    ...tableProps,
                }}
                items={initialItems} // TODO: fix useItems if actually using this
                onItemsChange={onItemsChange}
                selectedCount={selectedCount}
                onClearSelected={onClearSelected}
                types={types}
                extraItems={
                    !multiple && initialSelectedItems !== null
                        ? [initialSelectedItems]
                        : initialSelectedItems
                }
                {...props}
            />
            {multiple && !withoutButtons && currentMedia === null ? (
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
