/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Link from '@panneau/element-link';
import Form from '@panneau/form';

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

function TwoFactorDisable({
    action = '/user/two-factor-authentication',
    fields = null,
    explainationLabel = null,
    submitButtonLabel = null,
    size = 'lg',
    withCancelLink = true,
    cancelLink = '/home',
    cancelLabel = null,
    ...props
}) {
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
            submitButtonLabel={
                submitButtonLabel || (
                    <FormattedMessage
                        defaultMessage="Disable two factor authentication"
                        description="Button label"
                    />
                )
            }
            actions={
                withCancelLink ? (
                    <Link className="py-2 px-4" href={cancelLink}>
                        {cancelLabel || (
                            <FormattedMessage defaultMessage="Cancel" description="Link label" />
                        )}
                    </Link>
                ) : null
            }
            postForm={defaultPostForm}
            {...props}
        >
            <p>
                {explainationLabel || (
                    <FormattedMessage
                        defaultMessage="Do you really wish to disable two factor authentication on your account?"
                        description="Explaination label"
                    />
                )}
            </p>
        </Form>
    );
}

TwoFactorDisable.propTypes = propTypes;

export default TwoFactorDisable;
