import isArray from 'lodash-es/isArray';
import isObject from 'lodash-es/isObject';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Button, Media, Resource } from '@panneau/core';
import { usePanneauResource } from '@panneau/core/contexts';
import {
    MediasPickerContainer,
    type MediasPickerContainerProps,
    MediasResourcePicker,
    MediasResourcePickerProps,
} from '@panneau/medias';
import Dialog from '@panneau/modal-dialog';

interface MediasPickerModalProps extends Omit<
    MediasPickerContainerProps & MediasResourcePickerProps,
    'value' | 'onChange'
> {
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
    resource: resourceId = null,
    title = null,
    onChange = null,
    onClosed = null,
    confirmButton = null,
    cancelButton = null,
    multiple = false,
    ...props
}: MediasPickerModalProps) {
    const resource = usePanneauResource(resourceId);
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
            title={
                title ?? (
                    <FormattedMessage defaultMessage="Select media" description="Modal title" />
                )
            }
            withCancelButton={!mediaFormOpen}
            withSubmitButton={!mediaFormOpen}
            submitButtonLabel={
                <FormattedMessage defaultMessage="Confirm selection" description="Button label" />
            }
            submitButton={{
                ...confirmButton,
                disabled: selectedItems === null || selectedItems.length === 0,
            }}
            className="modal-fullscreen-lg-down"
            cancelButton={cancelButton}
            onClickSubmit={onConfirm}
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
