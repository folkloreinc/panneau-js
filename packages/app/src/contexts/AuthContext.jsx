/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    useAuthCheck,
    useAuthLogin,
    useAuthLogout,
    useAuthRegister,
    useAuthRequestPassword,
    useAuthResetPassword,
} from '../hooks';

const AuthContext = React.createContext(null);

export const useAuth = () => useContext(AuthContext);

export const useUser = () => {
    const { user } = useAuth();
    return user;
};

export const useSetUser = () => {
    const { setUser } = useAuth();
    return setUser;
};

export const useLogout = () => {
    const { logout } = useAuth();
    return logout;
};

export const useLoggedIn = () => {
    const { loggedIn } = useAuth();
    return loggedIn;
};

const propTypes = {
    children: PropTypes.node.isRequired,
    user: PanneauPropTypes.user,
    checkOnMount: PropTypes.bool,
};

const defaultProps = {
    user: null,
    checkOnMount: false,
};

export const AuthProvider = ({ user: initialUser, checkOnMount, children }) => {
    // const route = useUrlGenerator();
    const [user, setUser] = useState(initialUser);
    const { login: authLogin } = useAuthLogin();
    const { logout: authLogout } = useAuthLogout();
    const { check: authCheck } = useAuthCheck();
    const { register: authRegister } = useAuthRegister();
    const { request: authRequestPassword } = useAuthRequestPassword();
    const { reset: authResetPassword } = useAuthResetPassword();

    const login = useCallback(
        (email, password) =>
            authLogin(email, password).then((newUser) => {
                setUser(newUser);
                return newUser;
            }),
        [authLogin, setUser],
    );

    const logout = useCallback(
        () =>
            authLogout().then(() => {
                setUser(null);
            }),
        [authLogout, setUser],
    );

    const register = useCallback(
        (data) =>
            authRegister(data).then((newUser) => {
                setUser(newUser);
                return newUser;
            }),
        [authRegister, setUser],
    );

    const requestPassword = useCallback(
        (email) => authRequestPassword(email),
        [authRequestPassword],
    );

    const resetPassword = useCallback((data) => authResetPassword(data), [authResetPassword]);

    useEffect(() => {
        if (checkOnMount) {
            authCheck()
                .then((newUser = null) => {
                    setUser(newUser);
                })
                .catch(() => {
                    setUser(null);
                });
        }
    }, [authCheck, setUser, checkOnMount]);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loggedIn: user !== null,
                logout,
                login,
                register,
                requestPassword,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = propTypes;
AuthProvider.defaultProps = defaultProps;

export default AuthContext;
