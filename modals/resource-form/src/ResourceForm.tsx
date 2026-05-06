import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Item, Resource } from '@panneau/core';
import { usePanneauResource } from '@panneau/core/contexts';
import ResourceForm from '@panneau/form-resource';
import { useResourceValues } from '@panneau/intl';
import Dialog from '@panneau/modal-dialog';

interface ModalResourceFormProps {
    id?: string;
    resource?: Resource | string | null;
    type?: string | null;
    item?: Item | null;
    isCreate?: boolean;
    withoutCloseOnComplete?: boolean;
    onComplete?: ((value: Item) => void) | null;
    onClosed?: (() => void) | null;
    className?: string | null;
}

function ModalResourceForm({
    id,
    resource: providedResource = null,
    type = null,
    item = null,
    isCreate = false,
    onComplete = null,
    onClosed = null,
    withoutCloseOnComplete = false,
    className = null,
}: ModalResourceFormProps) {
    const [opened, setOpened] = useState(true);
    const requestClose = useCallback(() => {
        setOpened(false);
    }, [onClosed]);
    const resource = usePanneauResource(providedResource);
    const resourceValues = useResourceValues(resource);
    const onFormComplete = useCallback(
        (value) => {
            if (onComplete !== null) {
                onComplete(value);
            }
            if (!withoutCloseOnComplete) {
                setOpened(false);
            }
        },
        [withoutCloseOnComplete, onComplete],
    );
    return (
        <Dialog
            id={id || `resource-form-modal-${resource?.id}`}
            title={
                !isCreate ? (
                    <FormattedMessage
                        values={resourceValues}
                        defaultMessage="Edit {a_singular}"
                        description="Page title"
                    />
                ) : (
                    <FormattedMessage
                        values={resourceValues}
                        defaultMessage="Create {a_singular}"
                        description="Page title"
                    />
                )
            }
            size="lg"
            visible={opened}
            requestClose={requestClose}
            onClosed={onClosed}
            className={className}
        >
            <ResourceForm
                resource={resource}
                type={type}
                item={item}
                onComplete={onFormComplete}
                isModal
            />
        </Dialog>
    );
}

export default ModalResourceForm;
