import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { type Media, Resource } from '@panneau/core';
import { MediasPickerContainer, MediasResourcePicker } from '@panneau/medias';
import Dialog from '@panneau/modal-dialog';

interface MediasPickerModalProps {
    id: string;
    value?: Media | Media[] | null;
    resource?: Resource | string | null;
    title?: string | null;
    multiple?: boolean;
    onChange?: ((items: Media | Media[]) => void) | null;
    onClosed?: (() => void) | null;
    confirmButton?: Record<string, unknown> | null;
    cancelButton?: Record<string, unknown> | null;
}

function MediasPickerModal({
    id,
    value = null,
    resource = null,
    title = null,
    onChange = null,
    onClosed = null,
    confirmButton = null,
    cancelButton = null,
    multiple = false,
    ...props
}: MediasPickerModalProps) {
    const [opened, setOpened] = useState(true);
    const requestClose = useCallback(() => {
        setOpened(false);
    }, [onClosed]);
    const [selectedItems, setSelectedItems] = useState(value);
    const onConfirm = useCallback(() => {
        if (onChange !== null) {
            onChange(selectedItems);
        }
        requestClose();
    }, [onChange, requestClose, selectedItems]);

    const onSelectionChange = useCallback(
        (items: Media | Media[]) => {
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
            id={id || 'medias-picker'}
            size="xl"
            visible={opened}
            requestClose={requestClose}
            onClosed={onClosed}
            title={title}
            buttons={
                !mediaFormOpen
                    ? [
                          {
                              id: 'cancel',
                              label: (
                                  <FormattedMessage
                                      defaultMessage="Cancel"
                                      description="Button label"
                                  />
                              ),
                              theme: 'secondary',
                              onClick: requestClose,
                              ...cancelButton,
                          },
                          {
                              id: 'confirm',
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
                    onClose={requestClose}
                    multiple={multiple}
                    onMediaFormOpen={onMediaFormOpen}
                    onMediaFormClose={onMediaFormClose}
                />
            ) : (
                <MediasPickerContainer
                    {...props}
                    value={selectedItems}
                    onChange={onSelectionChange}
                    onClose={requestClose}
                    multiple={multiple}
                    onMediaFormOpen={onMediaFormOpen}
                    onMediaFormClose={onMediaFormClose}
                />
            )}
        </Dialog>
    );
}

export default MediasPickerModal;
