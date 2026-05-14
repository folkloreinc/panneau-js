import { ForwardedRef, type ReactNode, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Field } from '@panneau/core';
import Form from '@panneau/form';
import Dialog from '@panneau/modal-dialog';

interface ModalFormProps {
    id: string | number;
    title?: ReactNode | null;
    name?: string | null;
    fields?: Field[] | null;
    action?: string | null;
    type?: string;
    onComplete?: ((value: unknown) => void) | null;
    onCancel?: (() => void) | null;
    onClosed?: (() => void) | null;
    submitButtonLabel?: ReactNode | null;
    withoutCloseOnComplete?: boolean;
    className?: string | null;
    children?: ReactNode | null;
    formRef?: ForwardedRef<HTMLFormElement> | null;
}

function ModalForm({
    id,
    title = null,
    name = null,
    fields = null,
    action = null,
    type = 'normal',
    onComplete = null,
    onCancel = null,
    onClosed = null,
    submitButtonLabel = null,
    withoutCloseOnComplete = false,
    className = null,
    children = null,
    formRef = null,
    ...props
}: ModalFormProps) {
    const [opened, setOpened] = useState(true);
    const requestClose = () => {
        setOpened(false);
    };
    const onFormCancel = useCallback(() => {
        setOpened(false);
        if (onCancel !== null) {
            onCancel();
        }
    }, [onCancel]);
    const onFormComplete = useCallback(
        (value) => {
            if (!withoutCloseOnComplete) {
                setOpened(false);
            }
            if (onComplete !== null) {
                onComplete(value);
            }
        },
        [withoutCloseOnComplete, onComplete],
    );
    return (
        <Dialog
            id={id}
            title={
                title ||
                (name !== null ? (
                    <FormattedMessage
                        defaultMessage="Edit {name}"
                        description="Page title"
                        values={{ name }}
                    />
                ) : (
                    <FormattedMessage defaultMessage="Edit" description="Page title" />
                ))
            }
            size="lg"
            visible={opened}
            requestClose={requestClose}
            onClosed={onClosed}
            className={className}
        >
            {children}
            <Form
                {...props}
                ref={formRef}
                fields={fields}
                action={action}
                type={type}
                buttonSize="md"
                onComplete={onFormComplete}
                onCancel={onFormCancel}
                submitButtonLabel={submitButtonLabel}
            />
        </Dialog>
    );
}

export default ModalForm;
