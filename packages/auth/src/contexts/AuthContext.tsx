/* eslint-disable react/jsx-props-no-spreading */
import type { ReactNode } from 'react';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

import type { User } from '@panneau/core/types';

import {
    useAuthCheck,
    useAuthLogin,
    useAuthLogout,
    useAuthRegister,
    useAuthRequestPassword,
    useAuthResetPassword,
} from '../hooks';

type RegisterData = Record<string, unknown>;
type ResetPasswordData = Record<string, unknown>;

interface AuthContextValue {
    user: User | null;
    setUser: (nextUser: User) => void;
    loggedIn: boolean;
    logout: () => Promise<unknown>;
    login: (email: string, password: string) => Promise<User>;
    register: (data: RegisterData) => Promise<User>;
    requestPassword: (email: string) => Promise<unknown>;
    resetPassword: (data: ResetPasswordData) => Promise<unknown>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    setUser: () => {},
    loggedIn: false,
    logout: () => Promise.reject(),
    login: () => Promise.reject(),
    register: () => Promise.reject(),
    requestPassword: () => Promise.reject(),
    resetPassword: () => Promise.reject(),
});

export const useAuth = () => use(AuthContext);

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

interface AuthProviderProps {
    children: ReactNode;
    user?: User | null;
    onLogout?: (() => void) | null;
    checkOnMount?: boolean;
}

export const AuthProvider = ({
    user: initialUser = null,
    checkOnMount = false,
    onLogout = null,
    children,
}: AuthProviderProps) => {
    // const route = useUrlGenerator();
    const [user, setUser] = useState(initialUser);
    const { login: authLogin } = useAuthLogin();
    const { logout: authLogout } = useAuthLogout();
    const { check: authCheck } = useAuthCheck();
    const { register: authRegister } = useAuthRegister();
    const { request: authRequestPassword } = useAuthRequestPassword();
    const { reset: authResetPassword } = useAuthResetPassword();

    const login = useCallback(
        (email: string, password: string) =>
            authLogin(email, password).then((newUser: User) => {
                setUser(newUser);
                return newUser;
            }),
        [authLogin, setUser],
    );

    const logout = useCallback(
        () =>
            authLogout()
                .then(() => {
                    setUser(null);
                })
                .then(() => {
                    if (onLogout !== null) {
                        onLogout();
                    }
                }),
        [authLogout, setUser, onLogout],
    );

    const register = useCallback(
        (data: RegisterData) =>
            authRegister(data).then((newUser: User) => {
                setUser(newUser);
                return newUser;
            }),
        [authRegister, setUser],
    );

    const requestPassword = useCallback(
        (email: string) => authRequestPassword(email),
        [authRequestPassword],
    );

    const resetPassword = useCallback(
        (data: ResetPasswordData) => authResetPassword(data),
        [authResetPassword],
    );

    useEffect(() => {
        if (checkOnMount) {
            authCheck()
                .then((newUser: User = null) => {
                    setUser(newUser);
                })
                .catch(() => {
                    setUser(null);
                });
        }
    }, [authCheck, setUser, checkOnMount]);

    const value = useMemo(
        () => ({
            user,
            setUser,
            loggedIn: user !== null,
            logout,
            login,
            register,
            requestPassword,
            resetPassword,
        }),
        [user, setUser, logout, login, register, requestPassword, resetPassword],
    );

    return <AuthContext value={value}>{children}</AuthContext>;
};

export default AuthContext;
