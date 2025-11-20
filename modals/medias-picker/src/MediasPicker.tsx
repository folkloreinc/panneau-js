import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { MediasPickerContainer, MediasResourcePicker } from '@panneau/medias';
import Dialog from '@panneau/modal-dialog';

interface MediasPickerModalProps {
    id: string | number;
    value?: Record<string, unknown> | null;
    resource?: string | null;
    title?: string | null;
    multiple?: boolean;
    onChange?: ((items: unknown) => void) | null;
    onClose?: (() => void) | null;
    confirmButton?: Record<string, unknown> | null;
    cancelButton?: Record<string, unknown> | null;
}

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
}: MediasPickerModalProps) {
    const [selectedItems, setSelectedItems] = useState(value);
    const onConfirm = useCallback(() => {
        if (onChange !== null) {
            onChange(selectedItems);
        }
        if (onClose !== null) {
            onClose();
        }
    }, [onChange, onClose, selectedItems]);

    const onSelectionChange = useCallback(
        (items: unknown) => {
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

export default MediasPickerModal;
