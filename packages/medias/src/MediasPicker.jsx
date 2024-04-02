/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useItemSelection } from '@panneau/core/hooks';
import Button from '@panneau/element-button';

import MediasBrowser from './MediasBrowser';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.arrayOf(PropTypes.shape({})),
    selectedItems: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    multiple: PropTypes.bool,
    withoutButtons: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    selectedItems: null,
    onClose: null,
    multiple: false,
    withoutButtons: false,
    className: null,
};

function MediasPicker({
    value,
    selectedItems: initialSelectedItems,
    onChange,
    onConfirm,
    onClose,
    multiple,
    withoutButtons,
    className,
    ...props
}) {
    const [items, setItems] = useState(value);
    const onItemsChange = useCallback(
        (pageItems) => {
            setItems(pageItems);
        },
        [setItems],
    );
    const disabled = value === null || value.length < 1;

    const {
        onSelectItem,
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
                }}
                onSelectItem={onSelectItem}
                onItemsChange={onItemsChange}
                selectedCount={selectedCount}
                onClearSelected={onClearSelected}
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
                            onClick={onConfirm}
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
