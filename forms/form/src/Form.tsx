import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import classNames from 'classnames';
import { ForwardedRef, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { ControlSize, Field, Label } from '@panneau/core';
import { useFormComponent, useFormDefinition } from '@panneau/core/contexts';
import { useForm } from '@panneau/core/hooks';
import type { FormProps as BaseFormProps } from '@panneau/element-form';

export interface FormProps extends Omit<BaseFormProps, 'onChange'> {
    action: string;
    method?: string | null;
    postForm?: ((action: string, data: unknown) => Promise<unknown>) | null;
    postOptions?: Record<string, unknown> | null;
    postData?: Record<string, unknown> | null;
    type?: string;
    fields?: Field[];
    size?: ControlSize;
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

    const formDefinition = useFormDefinition(type);
    console.log({
        type,
        formDefinition
    })
    const {
        component: definitionComponent,
        fields: definitionFields,
        method: definitionMethod,
        action: definitionAction,
        submitButtonLabel: definitionSubmitButtonLabel,
        ...definitionProps
    } = formDefinition || {};

    const finalComponent = definitionComponent ?? type ?? 'normal';
    const finalFields = providedFields ?? definitionFields;
    const finalMethod = method ?? definitionMethod;
    const finalAction = action ?? definitionAction;
    const finalSubmitButtonLabel = submitButtonLabel ?? definitionSubmitButtonLabel;

    const FormComponent = useFormComponent(finalComponent);

    const defaultPostForm = useCallback(
        (act: string, data: unknown) =>
            postJSON(act, postData !== null ? { ...postData, ...data } : data, {
                credentials: 'include',
                headers: getCSRFHeaders(),
                ...(finalMethod !== null ? { method: finalMethod } : null),
                ...(postOptions !== null ? postOptions : null),
            }),
        [finalMethod, postOptions, postData],
    );

    const { value, setValue, fields, onSubmit, status, generalError, errors } = useForm({
        action: finalAction,
        fields: finalFields,
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
            {...definitionProps}
            {...props}
            ref={ref}
            action={finalAction}
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
                finalSubmitButtonLabel || (
                    <FormattedMessage defaultMessage="Save" description="Button label" />
                )
            }
        />
    );
}

export default Form;
