/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import FormStatus from '@panneau/element-form-status';
import Button from '@panneau/element-button';

const propTypes = {
    action: PropTypes.string,
    status: PanneauPropTypes.formStatus,
    children: PropTypes.node,
    actions: PropTypes.node,
    saveButtonLabel: PanneauPropTypes.label,
    className: PropTypes.string,
    onSubmit: PropTypes.func,
    withoutActions: PropTypes.bool,
};

const defaultProps = {
    action: null,
    status: null,
    children: null,
    actions: null,
    saveButtonLabel: null,
    className: null,
    onSubmit: null,
    withoutActions: false,
};

const Form = ({
    action,
    status,
    children,
    actions,
    saveButtonLabel,
    onSubmit,
    withoutActions,
    className,
}) => (
    <form action={action} method="post" onSubmit={onSubmit} className={className}>
        {children}
        {!withoutActions ? (
            <div className="mt4 d-flex align-items-center">
                {status !== null ? <FormStatus status={status} /> : null}
                {actions}
                <Button
                    type="submit"
                    theme="primary"
                    size="lg"
                    label={
                        saveButtonLabel || <FormattedMessage id="form.save" defaultMessage="Save" />
                    }
                    className={classNames({
                        'ml-auto': actions === null,
                    })}
                />
            </div>
        ) : null}
    </form>
);

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

export default Form;
