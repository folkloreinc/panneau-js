import classNames from 'classnames';
import { ForwardedRef, type ReactNode } from 'react';

import type { Button, Field, FormStatus, Resource } from '@panneau/core';
import { useFieldComponent, usePreviewComponent } from '@panneau/core/contexts';
import Form from '@panneau/element-form';

interface TwoPaneFormProps {
    fields: Record<string, unknown>;
    resource?: Resource | null;
    size?: 'half' | 'medium' | 'large' | null;
    value?: Record<string, unknown> | null;
    onChange: (value: Record<string, unknown>) => void;
    onSubmit: () => void;
    status?: FormStatus | null;
    generalError?: string | null;
    errors?: Record<string, string[]> | null;
    buttons?: Button[] | null;
    children?: ReactNode | null;
    className?: string | null;
    ref?: ForwardedRef<HTMLFormElement> | null;
}

function TwoPaneForm({
    resource = null,
    fields = null,
    size = 'medium',
    status = null,
    value = null,
    onChange = null,
    onSubmit = null,
    errors = null,
    buttons = null,
    children = null,
    className = null,
    ref,
    ...props
}: TwoPaneFormProps) {
    const { id = null } = resource || {};
    const FieldsComponent = useFieldComponent('fields');
    const PreviewComponent = usePreviewComponent(id);

    const formClassName = classNames([
        'form',
        'col-12',
        {
            'col-lg-6': size === 'half',
            'col-lg-5': size === 'medium',
            'col-lg-4': size === 'large',
            [className]: className !== null,
        },
    ]);

    const previewClassName = classNames([
        'preview',
        'col-12',
        {
            'col-lg-6': size === 'half',
            'col-lg-7': size === 'medium',
            'col-lg-8': size === 'large',
        },
    ]);

    return (
        <div className="container-fluid row gx-4">
            <Form
                className={formClassName}
                status={status}
                buttons={buttons}
                onSubmit={onSubmit}
                errors={errors}
                ref={ref}
                {...props}
            >
                <FieldsComponent
                    fields={fields}
                    value={value}
                    onChange={onChange}
                    errors={errors}
                />
            </Form>
            <div className={previewClassName}>
                {PreviewComponent !== null ? (
                    <PreviewComponent resource={resource} value={value} />
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

export default TwoPaneForm;
