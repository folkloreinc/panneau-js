import classNames from 'classnames';
import { ForwardedRef, type ReactNode } from 'react';

import { type Button, type Field, type FormStatus, type Resource } from '@panneau/core';
import { useFieldComponent } from '@panneau/core/contexts';
import Form from '@panneau/element-form';

interface NormalFormProps {
    fields: Field[];
    value?: Record<string, unknown> | null;
    onChange: (value: Record<string, unknown>) => void;
    onSubmit?: (() => void) | null;
    status?: FormStatus | null;
    generalError?: string | null;
    errors?: Record<string, string[]> | null;
    buttons?: Button[] | null;
    disabled?: boolean;
    children?: ReactNode | null;
    className?: string | null;
    fieldsClassName?: string | null;
    ref?: ForwardedRef<HTMLFormElement> | null;
    resource?: Resource | null;
    item?: Record<string, unknown> | null;
    isCreate?: boolean;
    loading?: boolean;
}

function NormalForm({
    fields,
    status = null,
    value = null,
    onChange,
    onSubmit = null,
    buttons = null,
    disabled = false,
    children = null,
    className = null,
    fieldsClassName = null,
    ref,
    // Given by the resource form and not used here: keep them off the <form> element
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resource: _resource = null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    item: _item = null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isCreate: _isCreate = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loading: _loading = false,
    ...props
}: NormalFormProps) {
    const FieldsComponent = useFieldComponent('fields');

    return (
        <Form
            className={classNames(['form', className])}
            status={status}
            buttons={buttons}
            disabled={disabled}
            onSubmit={onSubmit}
            ref={ref}
            {...props}
        >
            {children !== null ? (
                children
            ) : (
                <FieldsComponent
                    fields={fields}
                    value={value}
                    className={fieldsClassName}
                    onChange={onChange}
                    disabled={disabled}
                />
            )}
        </Form>
    );
}

export default NormalForm;
