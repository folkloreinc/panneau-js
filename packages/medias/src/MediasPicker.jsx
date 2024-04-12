/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useItemSelection } from '@panneau/core/hooks';
import Button from '@panneau/element-button';

import MediasBrowser from './MediasBrowser';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    items: PropTypes.arrayOf(PropTypes.shape({})),
    value: PropTypes.arrayOf(PropTypes.shape({})),
    types: PropTypes.arrayOf(PropTypes.string),
    uploadButton: PropTypes.shape({}),
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
    uploadButton: null,
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
    uploadButton,
    onChange,
    onConfirm,
    onClose,
    multiple,
    withoutButtons,
    tableProps,
    className,
    ...props
}) {
    const [items, setItems] = useState(initialItems);
    const onItemsChange = useCallback(
        (pageItems) => {
            setItems(pageItems);
        },
        [setItems],
    );
    const disabled = initialItems === null || initialItems.length < 1;

    const {
        onSelectItem,
        onSelectItems,
        onSelectPage,
        onClearSelected,
        pageSelected,
        selectedCount,
        selectedItems,
    } = useItemSelection({
        items,
        selectedItems: initialSelectedItems,
        onSelectionChange: onChange,
        multipleSelection: multiple,
    });

    const onConfirmSelection = useCallback(() => {
        if (onConfirm !== null) {
            onConfirm(selectedItems);
        }
    }, [selectedItems, onConfirm]);

    const finalUploadButton = useMemo(
        () => ({
            ...(uploadButton || null),
            ...(types !== null ? { types } : null),
            allowMultipleUploads: multiple,
            maxNumberOfFiles: multiple ? 10 : 0,
            value: selectedItems,
        }),
        [uploadButton, selectedItems, multiple],
    );

    return (
        <div className={className}>
            <MediasBrowser
                tableProps={{
                    selectable: multiple,
                    multipleSelection: multiple,
                    onSelectItem,
                    onSelectPage,
                    selectedItems,
                    pageSelected,
                    ...tableProps,
                }}
                items={items}
                onSelectItem={onSelectItem}
                onSelectItems={onSelectItems}
                onItemsChange={onItemsChange}
                selectedCount={selectedCount}
                onClearSelected={onClearSelected}
                uploadButton={finalUploadButton}
                types={types}
                {...props}
            />
            {multiple && !withoutButtons ? (
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
