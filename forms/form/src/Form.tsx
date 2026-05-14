import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import classNames from 'classnames';
import { ForwardedRef, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Field, Label } from '@panneau/core';
import { useFormComponent } from '@panneau/core/contexts';
import { useForm } from '@panneau/core/hooks';
import type { FormProps as BaseFormProps } from '@panneau/element-form';

interface FormProps extends BaseFormProps {
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
    withValidation?: boolean;
    className?: string | null;
    ref?: ForwardedRef<HTMLFormElement> | null;
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
    withValidation = false,
    ref,
    ...props
}: FormProps) {
    const [wasValidated, setWasValidated] = useState(false);
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
        postForm: (act: string, data: unknown) =>
            (postForm || defaultPostForm)(act, data).then((result) => {
                setWasValidated(false);
                return result;
            }),
        onComplete,
        value: providedValue,
        setValue: parentOnChange,
        ...useFormProps,
    });

    const onFormSubmit = useCallback(
        (event) => {
            setWasValidated(true);
            onSubmit(event);
        },
        [onSubmit],
    );

    return (
        <FormComponent
            {...props}
            ref={ref}
            action={action}
            method="post"
            fields={fields}
            onSubmit={withValidation ? onFormSubmit : onSubmit}
            className={classNames([
                className,
                {
                    'was-validated': wasValidated,
                },
            ])}
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
