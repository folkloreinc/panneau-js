import { FormattedMessage } from 'react-intl';

import type { Resource } from '@panneau/core/types';
import ResourceForm from '@panneau/form-resource';
import { useResourceValues } from '@panneau/intl';
import Dialog from '@panneau/modal-dialog';

interface ModalResourceFormProps {
    id: string | number;
    resource?: Resource | null;
    type?: string | null;
    item?: { id?: string } | null;
    isCreate?: boolean;
    onSuccess?: ((value: unknown) => void) | null;
    onClose?: (() => void) | null;
    className?: string | null;
}

function ModalResourceForm({
    id,
    resource = null,
    type = null,
    item = null,
    isCreate = false,
    onSuccess = null,
    onClose = null,
    className = null,
}: ModalResourceFormProps) {
    const resourceValues = useResourceValues(resource);
    return (
        <Dialog
            id={id}
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
            onClose={onClose}
            className={className}
        >
            <ResourceForm
                resource={resource}
                type={type}
                item={item}
                onSuccess={onSuccess}
                isModal
            />
        </Dialog>
    );
}

export default ModalResourceForm;
