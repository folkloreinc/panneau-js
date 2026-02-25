import type { Button, Field, FormStatus } from '@panneau/core';
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
}

function HorizontalForm({
    fields,
    status = null,
    value = null,
    onChange,
    className = null,
    onSubmit = null,
    ...props
}: HorizontalFormProps) {
    const FieldsComponent = useFieldComponent('fields');
    return (
        <Form onSubmit={onSubmit} className={className} status={status} {...props}>
            <FieldsComponent
                fields={fields.map((f) => ({ ...f, horizontal: true }))}
                value={value}
                onChange={onChange}
            />
        </Form>
    );
}

export default HorizontalForm;
