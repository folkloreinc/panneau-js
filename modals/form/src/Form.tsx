import { ForwardedRef, type ReactNode, useCallback, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { mergeRefs } from '@panneau/core/utils';
import Form, { FormProps } from '@panneau/form';
import Dialog, { DialogProps } from '@panneau/modal-dialog';

export interface FormModalProps
    extends Omit<FormProps, 'id' | 'title'>, Pick<DialogProps, 'id' | 'title' | 'size'> {
    name?: string | null;
    type?: string;
    onCancel?: (() => void) | null;
    onClosed?: (() => void) | null;
    withoutCloseOnComplete?: boolean;
    className?: string | null;
    children?: ReactNode | null;
    formRef?: ForwardedRef<HTMLFormElement> | null;
}

function FormModal({
    id,
    title = null,
    name = null,
    fields = null,
    type = 'normal',
    size = 'lg',
    onComplete = null,
    onCancel = null,
    onClosed = null,
    withoutCloseOnComplete = false,
    className = null,
    children = null,
    formRef: customFormRef = null,
    submitButtonLabel = null,
    cancelButtonLabel = null,
    withCancelButton = true,
    withoutSubmitButton = false,
    ...props
}: FormModalProps) {
    const [opened, setOpened] = useState(true);
    const formRef = useRef<HTMLFormElement>(null);
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
    const onClickSubmit = useCallback(() => {
        if (formRef.current !== null) {
            formRef.current.requestSubmit();
        }
    }, []);
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
            size={size}
            visible={opened}
            withCancelButton={withCancelButton}
            withSubmitButton={!withoutSubmitButton}
            requestClose={requestClose}
            onClosed={onClosed}
            onClickSubmit={onClickSubmit}
            className={className}
            submitButtonLabel={submitButtonLabel}
            cancelButtonLabel={cancelButtonLabel}
        >
            {children}
            <Form
                withoutActions
                {...props}
                ref={mergeRefs(formRef, customFormRef)}
                fields={fields}
                type={type}
                onComplete={onFormComplete}
                onCancel={onFormCancel}
            />
        </Dialog>
    );
}

export default FormModal;
