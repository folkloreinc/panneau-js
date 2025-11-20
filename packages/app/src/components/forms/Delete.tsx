import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import type { Field, FormStatus, Resource } from '@panneau/core/types';
import Button from '@panneau/element-button';
import Form from '@panneau/element-form';
import { useResourceValues } from '@panneau/intl';

interface DeleteFormProps {
    resource: Resource;
    action?: string | null;
    previous?: string | null;
    fields: Field[];
    value?: Record<string, unknown> | null;
    onChange: (value: Record<string, unknown>) => void;
    onSubmit?: ((e: React.FormEvent) => void) | null;
    status?: FormStatus | null;
    generalError?: string | null;
    errors?: Record<string, string[]> | null;
    className?: string | null;
}

// TODO: remove this? unused

function DeleteForm({
    resource,
    action = null,
    previous = null,
    status = null,
    value = null,
    onSubmit = null,
    errors = null,
    generalError = null,
    className = null,
    ...props
}: DeleteFormProps) {
    const { id = null } = value || {};
    const resourceValues = useResourceValues(resource, { id });
    // const { text, background } = usePanneauColorScheme();

    return (
        <Form
            className={classNames([
                'form',
                {
                    'invalid-feedback': generalError !== null,
                    [className]: className !== null,
                },
            ])}
            action={action}
            onSubmit={onSubmit}
            withoutActions
            withoutErrors
            {...props}
        >
            <div
                className={classNames([
                    'card',
                    {
                        // [`bg-${background}`]: background !== null,
                        // [`border-${text}`]: text !== null,
                        [className]: className !== null,
                    },
                ])}
            >
                <div className="card-body">
                    <FormattedMessage
                        values={resourceValues}
                        defaultMessage="Are you sure you want to delete {the_singular} #{id}?"
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
                    <Button type="submit" className="ms-auto" theme="danger">
                        <FormattedMessage defaultMessage="Delete" description="Button label" />
                    </Button>
                </div>
            </div>
        </Form>
    );
}

export default DeleteForm;
