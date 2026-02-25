import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import type { Field, FormStatus, Resource } from '@panneau/core';
// import { usePanneauColorScheme } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import Form from '@panneau/element-form';
import { useResourceValues } from '@panneau/intl';

interface DuplicateFormProps {
    resource: Resource;
    action?: string | null;
    previous?: string | null;
    fields: Field[];
    value?: Record<string, unknown> | null;
    onChange: (value: Record<string, unknown>) => void;
    onSubmit?: (() => void) | null;
    status?: FormStatus | null;
    generalError?: string | null;
    errors?: Record<string, string[]> | null;
    loading?: boolean;
    className?: string | null;
}

function DuplicateForm({
    resource,
    action = null,
    previous = null,
    status = null,
    value = null,
    onSubmit = null,
    errors = null,
    generalError = null,
    loading = false,
    className = null,
    ...props
}: DuplicateFormProps) {
    const { id = null } = value || {};
    const resourceValues = useResourceValues(resource, { id });
    return (
        <Form
            className={classNames([
                'form',
                {
                    'invalid-feedback': generalError !== null,
                    [className!]: className !== null,
                },
            ])}
            action={action}
            onSubmit={onSubmit}
            withoutActions
            withoutErrors
            disabled={loading}
            {...props}
        >
            <div
                className={classNames([
                    'card',
                    {
                        [className!]: className !== null,
                    },
                ])}
            >
                <div className="card-body">
                    <FormattedMessage
                        values={resourceValues}
                        defaultMessage="Are you sure you want to duplicate {the_singular} #{id}?"
                        description="Confirmation message"
                    />
                    {generalError ? (
                        <p className="text-danger">
                            <FormattedMessage
                                defaultMessage="An error occured and we could not delete this item successfully."
                                description="Error message"
                            />
                        </p>
                    ) : null}
                </div>
                <div className="card-body d-flex">
                    {previous !== null ? (
                        <Button href={previous} className="me-2" theme="secondary" outline>
                            <FormattedMessage defaultMessage="Cancel" description="Button label" />
                        </Button>
                    ) : null}
                    <Button type="submit" className="ms-auto" theme="warning" disabled={loading}>
                        <FormattedMessage defaultMessage="Duplicate" description="Button label" />
                    </Button>
                </div>
            </div>
        </Form>
    );
}

export default DuplicateForm;
