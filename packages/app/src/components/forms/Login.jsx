/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { useAuth } from '@panneau/auth';
import { useUrlGenerator } from '@panneau/core/contexts';
import { Login as PanneauLoginForm } from '@panneau/form-auth';

const propTypes = {
    className: PropTypes.string,
    onSuccess: PropTypes.func,
};

const defaultProps = {
    className: null,
    onSuccess: null,
};

const LoginForm = ({ className, onSuccess }) => {
    const url = useUrlGenerator();
    const { login } = useAuth();
    const postForm = useCallback((action, { email, password }) => login(email, password), [login]);

    return (
        <PanneauLoginForm
            action={url('auth.login')}
            postForm={postForm}
            onComplete={onSuccess}
            className={className}
            submitButtonLabel={
                <FormattedMessage defaultMessage="Log in" description="Button label" />
            }
        />
    );
};

LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default LoginForm;
