/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { useForm } from '@panneau/core/hooks';

import { useFieldComponent, useUrlGenerator } from '@panneau/core/contexts';

import FormGroup from '@panneau/element-form-group';
import Button from '@panneau/element-button';

import { useAuth } from '../../contexts/AuthContext';

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
    const { login = () => {} } = useAuth();
    const TextField = useFieldComponent('text');

    const postForm = useCallback((action, { email, password }) => login(email, password), [login]);
    const { fields, onSubmit } = useForm({
        fields: ['email', 'password'],
        postForm,
        onSuccess,
    });
    const { email = null, password = null } = fields || {};

    return (
        <form action={url('auth.login')} method="post" onSubmit={onSubmit} className={className}>
            <FormGroup label={<FormattedMessage id="form.email" defaultMessage="Email" />}>
                <TextField type="email" size="lg" {...email} />
            </FormGroup>
            <FormGroup label={<FormattedMessage id="form.password" defaultMessage="Password" />}>
                <TextField type="password" size="lg" {...password} />
            </FormGroup>
            <div className="mt4 d-flex">
                <Button type="submit" theme="primary" size="lg" className="ms-auto">
                    <FormattedMessage id="login" defaultMessage="Log in" />
                </Button>
            </div>
        </form>
    );
};

LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default LoginForm;
