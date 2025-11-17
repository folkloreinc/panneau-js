/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { MediasPickerContainer, MediasResourcePicker } from '@panneau/medias';
import Dialog from '@panneau/modal-dialog';

const propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    value: PropTypes.shape({}),
    resource: PropTypes.string,
    title: PropTypes.string,
    multiple: PropTypes.bool,
    onChange: PropTypes.func,
    onClose: PropTypes.func,
    confirmButton: PropTypes.shape({}),
    cancelButton: PropTypes.shape({}),
};

function MediasPickerModal({
    id,
    value = null,
    resource = null,
    title = null,
    onChange = null,
    onClose = null,
    confirmButton = null,
    cancelButton = null,
    multiple = false,
    ...props
})  {
    const [selectedItems, setSelectedItems] = useState(value);
    const onConfirm = useCallback(() => {
        if (onChange !== null) {
            onChange(selectedItems);
        }
        if (onClose !== null) {
            onClose();
        }
    }, [onChange, onClose]);

    const onSelectionChange = useCallback(
        (items) => {
            setSelectedItems(items);
        },
        [setSelectedItems],
    );

    const [mediaFormOpen, setMediaFormOpen] = useState(false);
    const onMediaFormOpen = useCallback(() => {
        setMediaFormOpen(true);
    }, [setMediaFormOpen]);
    const onMediaFormClose = useCallback(() => {
        setMediaFormOpen(false);
    }, [setMediaFormOpen]);

    return (
        <Dialog
            id={id || 'picker'}
            size="xl"
            onClose={onClose}
            title={title}
            buttons={
                !mediaFormOpen
                    ? [
                          {
                              id: 'cancel',
                              name: 'cancel',
                              label: (
                                  <FormattedMessage
                                      defaultMessage="Cancel"
                                      description="Button label"
                                  />
                              ),
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
                              ...confirmButton,
                          },
                      ]
                    : null
            }
        >
            {resource !== null ? (
                <MediasResourcePicker
                    {...props}
                    value={selectedItems}
                    resource={resource}
                    onChange={onSelectionChange}
                    onClose={onClose}
                    multiple={multiple}
                    onMediaFormOpen={onMediaFormOpen}
                    onMediaFormClose={onMediaFormClose}
                />
            ) : (
                <MediasPickerContainer
                    {...props}
                    value={selectedItems}
                    onChange={onSelectionChange}
                    onClose={onClose}
                    multiple={multiple}
                    onMediaFormOpen={onMediaFormOpen}
                    onMediaFormClose={onMediaFormClose}
                />
            )}
        </Dialog>
    );
}

MediasPickerModal.propTypes = propTypes;

export default MediasPickerModal;
