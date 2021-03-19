/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { useForm } from '@panneau/core/hooks';

import { useUrlGenerator } from '@panneau/core/contexts';
import { useAuth } from '@panneau/data';

import FormGroup from '@panneau/element-form-group';
import TextField from '@panneau/field-text';
import Button from '@panneau/element-button';

const propTypes = {
    className: PropTypes.string,
    onComplete: PropTypes.func,
};

const defaultProps = {
    className: null,
    onComplete: null,
};

const LoginForm = ({ className, onComplete }) => {
    const url = useUrlGenerator();
    const { login = () => {} } = useAuth();

    const postForm = useCallback((action, { email, password }) => login(email, password), [login]);
    const { fields, onSubmit } = useForm({
        fields: ['email', 'password'],
        postForm,
        onComplete,
    });

    return (
        <form action={url('auth.login')} method="post" onSubmit={onSubmit} className={className}>
            <FormGroup
                {...fields.email}
                label={<FormattedMessage id="form.email" defaultMessage="Email" />}
            >
                <TextField type="email" size="lg" {...fields.email} />
            </FormGroup>
            <FormGroup
                {...fields.password}
                label={<FormattedMessage id="form.password" defaultMessage="Password" />}
            >
                <TextField type="password" size="lg" {...fields.password} />
            </FormGroup>
            <div className="mt4 d-flex">
                <Button type="submit" theme="primary" size="lg" className="ml-auto">
                    <FormattedMessage id="login" defaultMessage="Log in" />
                </Button>
            </div>
        </form>
    );
};

LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default LoginForm;
