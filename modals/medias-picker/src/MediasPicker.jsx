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
    onConfirm: PropTypes.func,
    onClose: PropTypes.func,
    onChange: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    confirmButton: PropTypes.any,
    // eslint-disable-next-line react/forbid-prop-types
    cancelButton: PropTypes.any,
};

const defaultProps = {
    resource: null,
    title: null,
    multiple: false,
    onConfirm: null,
    onClose: null,
    onChange: null,
    confirmButton: null,
    cancelButton: null,
};

function MediasPickerModal({
    id,
    resource,
    title,
    onClose,
    onChange,
    onConfirm,
    confirmButton,
    cancelButton,
    multiple,
    ...props
}) {
    const [count, setCount] = useState(null);
    const onSelectionConfirm = useCallback(() => {
        if (onConfirm !== null) {
            onConfirm();
        }
        if (onClose !== null) {
            onClose();
        }
    }, [onConfirm, onClose]);

    const onSelectionChange = useCallback(
        (items) => {
            if (onChange !== null) {
                onChange(items);
            }
            setCount(items !== null ? items.length : 0);
        },
        [onChange, setCount],
    );
    return (
        <Dialog
            id={id}
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
                    disabled: count === null || count < 1,
                    ...confirmButton,
                },
            ]}
        >
            {resource !== null ? (
                <MediasResourcePicker
                    {...props}
                    resource={resource}
                    onChange={onSelectionChange}
                    onConfirm={onSelectionConfirm}
                    onClose={onClose}
                    multiple={multiple}
                    withoutButtons
                />
            ) : (
                <MediasPickerContainer
                    {...props}
                    resource={resource}
                    onChange={onSelectionChange}
                    onConfirm={onSelectionConfirm}
                    onClose={onClose}
                    multiple={multiple}
                    withoutButtons
                />
            )}
        </Dialog>
    );
}

MediasPickerModal.propTypes = propTypes;
MediasPickerModal.defaultProps = defaultProps;

export default MediasPickerModal;
