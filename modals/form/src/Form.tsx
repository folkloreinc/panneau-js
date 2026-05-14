import { ForwardedRef, useCallback, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { mergeRefs } from '@panneau/core/utils';
import Form, { FormProps } from '@panneau/form';
import Dialog, { DialogModalProps } from '@panneau/modal-dialog';

export interface FormModalProps extends Omit<FormProps, 'id' | 'title'>, DialogModalProps {
    withoutCloseOnComplete?: boolean;
    formRef?: ForwardedRef<HTMLFormElement> | null;
}

function FormModal({
    id,
    title = null,
    fields = null,
    size = 'lg',
    visible = null,
    requestClose: customRequestClose = null,
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
    const requestClose =
        customRequestClose ??
        (() => {
            setOpened(false);
        });
    const onFormCancel = () => {
        requestClose();
        if (onCancel !== null) {
            onCancel();
        }
    };
    const onFormComplete = (value) => {
        if (!withoutCloseOnComplete) {
            requestClose();
        }
        if (onComplete !== null) {
            onComplete(value);
        }
    };
    const onClickSubmit = useCallback(() => {
        if (formRef.current !== null) {
            formRef.current.requestSubmit();
        }
    }, []);
    return (
        <Dialog
            id={id}
            title={title || <FormattedMessage defaultMessage="Edit" description="Page title" />}
            size={size}
            visible={visible ?? opened}
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
                onComplete={onFormComplete}
                onCancel={onFormCancel}
            />
        </Dialog>
    );
}

export default FormModal;
