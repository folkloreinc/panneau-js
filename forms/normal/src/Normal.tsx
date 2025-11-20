import classNames from 'classnames';

import { useFieldComponent } from '@panneau/core/contexts';
import type { Button, Field, FormStatus } from '@panneau/core/types';
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
    children?: React.ReactNode | null;
    className?: string | null;
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
    ...props
}: NormalFormProps) {
    const FieldsComponent = useFieldComponent('fields');

    return (
        <Form
            className={classNames([
                'form',
                {
                    [className!]: className !== null,
                },
            ])}
            status={status}
            buttons={buttons}
            disabled={disabled}
            onSubmit={onSubmit}
            {...props}
        >
            {children !== null ? (
                children
            ) : (
                <FieldsComponent
                    fields={fields}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                />
            )}
        </Form>
    );
}

export default NormalForm;
