/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Form from '@panneau/form';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import Link from '@panneau/element-link';

const propTypes = {
    action: PropTypes.string,
    fields: PanneauPropTypes.fields,
    size: PropTypes.string,
    explainationLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
    withCancelLink: PropTypes.bool,
    cancelLink: PropTypes.string,
    cancelLabel: PanneauPropTypes.label,
};

const defaultProps = {
    action: '/user/two-factor-authentication',
    fields: null,
    size: 'lg',
    explainationLabel: (
        <FormattedMessage
            defaultMessage="Do you really wish to disable two factor authentication on your account?"
            description="Explaination label"
        />
    ),
    submitButtonLabel: (
        <FormattedMessage
            defaultMessage="Disable two factor authentication"
            description="Button label"
        />
    ),
    withCancelLink: true,
    cancelLink: '/home',
    cancelLabel: <FormattedMessage defaultMessage="Cancel" description="Link label" />,
};

const TwoFactorDisable = ({
    action,
    fields,
    explainationLabel,
    submitButtonLabel,
    size,
    withCancelLink,
    cancelLink,
    cancelLabel,
    ...props
}) => {
    const defaultPostForm = useCallback(
        (act, data) =>
            postJSON(act, data, {
                credentials: 'include',
                headers: getCSRFHeaders(),
                method: 'DELETE',
            }),
        [],
    );
    return (
        <Form
            action={action}
            submitButtonLabel={submitButtonLabel}
            actions={
                withCancelLink ? (
                    <Link className="py-2 px-4" href={cancelLink}>
                        {cancelLabel}
                    </Link>
                ) : null
            }
            postForm={defaultPostForm}
            {...props}
        >
            <p>{explainationLabel}</p>
        </Form>
    );
};

TwoFactorDisable.propTypes = propTypes;
TwoFactorDisable.defaultProps = defaultProps;

export default TwoFactorDisable;
