/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { MediasPickerContainer, MediasResourcePicker } from '@panneau/medias';
import Dialog from '@panneau/modal-dialog';

const propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    resource: PropTypes.string,
    title: PropTypes.string,
    multiple: PropTypes.bool,
    onChange: PropTypes.func,
    onClose: PropTypes.func,
    confirmButton: PropTypes.shape({}),
    cancelButton: PropTypes.shape({}),
};

const defaultProps = {
    resource: null,
    title: null,
    multiple: false,
    onChange: null,
    onClose: null,
    confirmButton: null,
    cancelButton: null,
};

function MediasPickerModal({
    id,
    resource,
    title,
    onChange,
    onClose,
    confirmButton,
    cancelButton,
    multiple,
    ...props
}) {
    const [selectedItems, setSelectedItems] = useState(null);

    const onConfirm = useCallback(
        (items) => {
            if (onChange !== null) {
                onChange(items);
            }
            if (onClose !== null) {
                onClose();
            }
        },
        [onChange, onClose],
    );

    const onSelectionChange = useCallback(
        (items) => {
            setSelectedItems(items);
        },
        [setSelectedItems],
    );

    return (
        <Dialog
            id={id || 'picker'}
            size="xl"
            onClose={onClose}
            title={title}
            buttons={[
                {
                    id: 'cancel',
                    name: 'cancel',
                    label: <FormattedMessage defaultMessage="Cancel" description="Button label" />,
                    theme: 'secondary',
                    onClick: onClose,
                    ...cancelButton,
                },
                {
                    id: 'confirm',
                    name: 'confirm',
                    label: (
                        <FormattedMessage
                            defaultMessage="Confirm selection"
                            description="Button label"
                        />
                    ),
                    theme: 'primary',
                    onClick: onConfirm,
                    disabled: selectedItems === null || (multiple && selectedItems.length === 0),
                    ...confirmButton,
                },
            ]}
        >
            {resource !== null ? (
                <MediasResourcePicker
                    {...props}
                    resource={resource}
                    onSelectionChange={onSelectionChange}
                    onChange={onChange}
                    onClose={onClose}
                    multipleSelection={multiple}
                />
            ) : (
                <MediasPickerContainer
                    {...props}
                    resource={resource}
                    onSelectionChange={onSelectionChange}
                    onChange={onChange}
                    onClose={onClose}
                    multipleSelection={multiple}
                />
            )}
        </Dialog>
    );
}

MediasPickerModal.propTypes = propTypes;
MediasPickerModal.defaultProps = defaultProps;

export default MediasPickerModal;
