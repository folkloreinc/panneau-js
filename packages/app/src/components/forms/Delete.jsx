/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { usePanneauColorScheme } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import Form from '@panneau/element-form';
import { useResourceValues } from '@panneau/intl';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    action: PropTypes.string,
    previous: PropTypes.string,
    fields: PanneauPropTypes.fields.isRequired,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    status: PanneauPropTypes.formStatus,
    generalError: PropTypes.string,
    errors: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
    className: PropTypes.string,
};

const defaultProps = {
    action: null,
    previous: null,
    status: null,
    value: null,
    onSubmit: null,
    generalError: null,
    errors: null,
    className: null,
};

const DeleteForm = ({
    resource,
    action,
    previous,
    status,
    value,
    onSubmit,
    errors,
    generalError,
    className,
    ...props
}) => {
    const { id = null } = value || {};
    const resourceValues = useResourceValues(resource, { id });
    const { text, background } = usePanneauColorScheme();

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
                        [`bg-${background}`]: background !== null,
                        [`border-${text}`]: text !== null,
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
};

DeleteForm.propTypes = propTypes;
DeleteForm.defaultProps = defaultProps;

export default DeleteForm;
