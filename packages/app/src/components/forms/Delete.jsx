/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Form from '@panneau/element-form';
import Button from '@panneau/element-button';

import messages from '../messages';

const propTypes = {
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
    action,
    previous,
    status,
    value,
    onSubmit,
    className,
    ...props
}) => {
    return (
        <Form
            className={classNames([
                'form',
                {
                    [className]: className !== null,
                },
            ])}
            action={action}
            onSubmit={onSubmit}
            withoutActions
            {...props}
        >
            <div className="card">
                <div className="card-body">
                    <FormattedMessage {...messages.confirm_delete} values={value} />
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
