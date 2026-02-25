import classNames from 'classnames';
import { type ReactNode } from 'react';

import type { Button, Field, FormStatus, Resource } from '@panneau/core';
import { useFieldComponent, usePreviewComponent } from '@panneau/core/contexts';
import Form from '@panneau/element-form';

interface TwoPaneFormProps {
    fields: Record<string, unknown>;
    resource?: Resource | null;
    value?: Record<string, unknown> | null;
    onChange: (value: Record<string, unknown>) => void;
    onSubmit: () => void;
    status?: FormStatus | null;
    generalError?: string | null;
    errors?: Record<string, string[]> | null;
    buttons?: Button[] | null;
    children?: ReactNode | null;
    className?: string | null;
}

function TwoPaneForm({
    resource = null,
    fields,
    status = null,
    value = null,
    onChange,
    onSubmit,
    errors = null,
    buttons = null,
    children = null,
    className = null,
    ...props
}: TwoPaneFormProps) {
    const { id = null } = resource || {};
    const FieldsComponent = useFieldComponent('fields');
    const PreviewComponent = usePreviewComponent(id);
    return (
        <div className="container-fluid row gx-4">
            <Form
                className={classNames([
                    'form',
                    'col-12',
                    'col-lg-6',
                    {
                        [className!]: className !== null,
                    },
                ])}
                resource={resource}
                status={status}
                buttons={buttons}
                onSubmit={onSubmit}
                errors={errors}
                {...props}
            >
                <FieldsComponent
                    fields={fields}
                    value={value}
                    onChange={onChange}
                    errors={errors}
                />
            </Form>
            <div className="col-12 col-lg-6">
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
