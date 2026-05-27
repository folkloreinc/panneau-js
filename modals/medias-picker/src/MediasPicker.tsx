import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Button, Media, Resource } from '@panneau/core';
import { MediasPickerContainer, MediasResourcePicker } from '@panneau/medias';
import Dialog from '@panneau/modal-dialog';

interface MediasPickerModalProps {
    id: string;
    value?: Media | Media[] | null;
    resource?: Resource | string | null;
    title?: string | null;
    multiple?: boolean;
    onChange?: ((items: Media | Media[] | null) => void) | null;
    onClosed?: (() => void) | null;
    confirmButton?: Button | null;
    cancelButton?: Button | null;
}

function MediasPickerModal({
    id,
    value: initialValue = null,
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
    const requestClose = () => {
        setOpened(false);
    };
    const [selectedItems, setSelectedItems] = useState<Media[] | null>(() =>
        isObject(initialValue) && !isArray(initialValue) ? [initialValue] : initialValue,
    );

    const onConfirm = () => {
        if (onChange !== null) {
            onChange(!multiple ? selectedItems?.[0] || null : selectedItems);
        }
        requestClose();
    };

    const onSelectionChange = (items: Media[]) => {
        setSelectedItems(items);
    };

    const [mediaFormOpen, setMediaFormOpen] = useState(false);
    const onMediaFormOpen = () => {
        setMediaFormOpen(true);
    };
    const onMediaFormClose = () => {
        setMediaFormOpen(false);
    };

    return (
        <Dialog
            id={id || 'medias-picker'}
            size="xl"
            visible={opened}
            requestClose={requestClose}
            onClosed={onClosed}
            title={title}
            withCancelButton={!mediaFormOpen}
            withSubmitButton={!mediaFormOpen}
            submitButtonLabel={
                <FormattedMessage defaultMessage="Confirm selection" description="Button label" />
            }
            submitButton={{
                ...confirmButton,
                disabled: selectedItems === null || selectedItems.length === 0,
            }}
            cancelButton={cancelButton}
            onClickSubmit={onConfirm}
            buttonsSize="lg"
        >
            {resource !== null ? (
                <MediasResourcePicker
                    {...props}
                    value={selectedItems}
                    resource={resource}
                    onChange={onSelectionChange}
                    multiple={multiple}
                    onMediaFormOpen={onMediaFormOpen}
                    onMediaFormClose={onMediaFormClose}
                />
            ) : (
                <MediasPickerContainer
                    {...props}
                    value={selectedItems}
                    onChange={onSelectionChange}
                    multiple={multiple}
                    onMediaFormOpen={onMediaFormOpen}
                    onMediaFormClose={onMediaFormClose}
                />
            )}
        </Dialog>
    );
}

export default MediasPickerModal;
