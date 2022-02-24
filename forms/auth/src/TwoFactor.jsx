/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Form from '@panneau/form';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

const propTypes = {
    action: PropTypes.string,
    fields: PanneauPropTypes.fields,
    size: PropTypes.string,
    explainationLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
    withSkipLink: PropTypes.bool,
    skipLink: PropTypes.string,
    skipLabel: PanneauPropTypes.label,
};

const defaultProps = {
    action: '/user/two-factor-authentication',
    fields: null,
    size: 'lg',
    explainationLabel: (
        <FormattedMessage
            defaultMessage="Do you wish to enable two factor authentication on your account? You will have to use an authentication app such as Google Authenticator or Microsoft Authenticator in addition to your password to connect."
            description="Explaination label"
        />
    ),
    submitButtonLabel: (
        <FormattedMessage
            defaultMessage="Enable Two Factor authentication"
            description="Button label"
        />
    ),
    withSkipLink: true,
    skipLink: '/home',
    skipLabel: <FormattedMessage defaultMessage="Skip setup" description="Link label" />,
};

const TwoFactor = ({
    action,
    fields,
    explainationLabel,
    submitButtonLabel,
    size,
    withSkipLink,
    skipLink,
    skipLabel,
    ...props
}) => (
    <Form
        action={action}
        submitButtonLabel={submitButtonLabel}
        actions={
            withSkipLink ? (
                <Link className="py-2 px-4" to={skipLink}>
                    {skipLabel}
                </Link>
            ) : null
        }
        {...props}
    >
        <p>{explainationLabel}</p>
    </Form>
);

TwoFactor.propTypes = propTypes;
TwoFactor.defaultProps = defaultProps;

export default TwoFactor;
