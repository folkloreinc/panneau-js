/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { useFieldComponent } from '@panneau/core/contexts';

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
    // const url = useUrlGenerator();
    const { login } = useAuth();
    const TextField = useFieldComponent('text');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const postForm = useCallback(
        (e) => {
            e.preventDefault();
            login(email, password).then(() => onSuccess());
        },
        [login, email, password],
    );

    const onChangeEmail = useCallback(
        (value) => {
            setEmail(value);
        },
        [setEmail],
    );

    const onChangePassword = useCallback(
        (value) => {
            setPassword(value);
        },
        [setPassword],
    );

    return (
        <form method="post" onSubmit={postForm} className={className}>
            <FormGroup label={<FormattedMessage id="form.email" defaultMessage="Email" />}>
                <TextField type="email" size="lg" value={email} onChange={onChangeEmail} />
            </FormGroup>
            <FormGroup label={<FormattedMessage id="form.password" defaultMessage="Password" />}>
                <TextField type="password" size="lg" value={password} onChange={onChangePassword} />
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
