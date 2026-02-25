import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Field, Label } from '@panneau/core';
import { useFormComponent } from '@panneau/core/contexts';
import { useForm } from '@panneau/core/hooks';

interface FormProps {
    action: string;
    method?: string | null;
    postForm?: ((action: string, data: unknown) => Promise<unknown>) | null;
    postOptions?: Record<string, unknown> | null;
    postData?: Record<string, unknown> | null;
    type?: string;
    fields: Field[];
    value?: Record<string, unknown> | null;
    onChange?: ((value: Record<string, unknown>) => void) | null;
    onComplete?: ((result: unknown) => void) | null;
    submitButtonLabel?: Label | null;
    useFormProps?: Record<string, unknown> | null;
    className?: string | null;
}

function Form({
    action,
    method = null,
    type = 'normal',
    postForm = null,
    postOptions = null,
    postData = null,
    fields: providedFields,
    value: providedValue = null,
    onChange: parentOnChange = null,
    onComplete = null,
    submitButtonLabel = null,
    useFormProps = null,
    className = null,
    ...props
}: FormProps) {
    const FormComponent = useFormComponent(type);

    const defaultPostForm = useCallback(
        (act: string, data: unknown) =>
            postJSON(act, postData !== null ? { ...postData, ...data } : data, {
                credentials: 'include',
                headers: getCSRFHeaders(),
                ...(method !== null ? { method } : null),
                ...(postOptions !== null ? postOptions : null),
            }),
        [method, postOptions, postData],
    );

    const { value, setValue, fields, onSubmit, status, generalError, errors } = useForm({
        action,
        fields: providedFields,
        postForm: postForm || defaultPostForm,
        onComplete,
        value: providedValue,
        setValue: parentOnChange,
        ...useFormProps,
    });

    return (
        <FormComponent
            {...props}
            action={action}
            method="post"
            fields={fields}
            onSubmit={onSubmit}
            className={className}
            status={status}
            generalError={generalError}
            errors={errors}
            value={value}
            onChange={setValue}
            submitButtonLabel={
                submitButtonLabel || (
                    <FormattedMessage defaultMessage="Save" description="Button label" />
                )
            }
        />
    );
}

export default Form;
