/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { Field } from '@panneau/core/types';
import Form from '@panneau/form';
import Dialog from '@panneau/modal-dialog';

interface ModalFormProps {
    id: string | number;
    title?: React.ReactNode | null;
    name?: string | null;
    fields?: Field[] | null;
    action?: string | null;
    type?: string;
    item?: { id?: string } | null;
    onComplete?: ((value: unknown) => void) | null;
    onClose?: (() => void) | null;
    submitButtonLabel?: React.ReactNode | null;
    className?: string | null;
    children?: React.ReactNode | null;
}

function ModalForm({
    id,
    title = null,
    name = null,
    fields = null,
    action = null,
    type = 'normal',
    item = null,
    onComplete = null,
    onClose = null,
    submitButtonLabel = null,
    className = null,
    children = null,
    ...props
}: ModalFormProps)  {
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
            onClose={onClose}
            className={className}
        >
            {children}
            <Form
                {...props}
                fields={fields}
                action={action}
                type={type}
                item={item}
                buttonSize="md"
                onComplete={onComplete}
                onCancel={onClose}
                submitButtonLabel={submitButtonLabel}
            />
        </Dialog>
    );
}

export default ModalForm;
