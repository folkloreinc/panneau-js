import { ForwardedRef } from 'react';

import type { Button, Field, FormStatus, Resource } from '@panneau/core';
import { useFieldComponent } from '@panneau/core/contexts';
import Form from '@panneau/element-form';

// import Button from '@panneau/element-button';

interface HorizontalFormProps {
    fields: Field[];
    value?: Record<string, unknown> | null;
    onChange: (value: Record<string, unknown>) => void;
    onSubmit?: (() => void) | null;
    status?: FormStatus | null;
    generalError?: string | null;
    errors?: Record<string, string[]> | null;
    buttons?: Button[] | null;
    className?: string | null;
    ref?: ForwardedRef<HTMLFormElement> | null;
    resource?: Resource | null;
    item?: Record<string, unknown> | null;
    isCreate?: boolean;
    loading?: boolean;
}

function HorizontalForm({
    fields,
    status = null,
    value = null,
    onChange,
    className = null,
    onSubmit = null,
    ref = null,
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
}: HorizontalFormProps) {
    const FieldsComponent = useFieldComponent('fields');
    return (
        <Form onSubmit={onSubmit} className={className} status={status} ref={ref} {...props}>
            <FieldsComponent
                fields={fields.map((f) => ({ ...f, horizontal: true }))}
                value={value}
                onChange={onChange}
            />
        </Form>
    );
}

export default HorizontalForm;
