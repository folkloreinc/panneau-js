/* eslint-disable react/jsx-props-no-spreading */
import { RoutesContext, RoutesProvider, useRoutes, useUrlGenerator } from '@folklore/routes';
import isString from 'lodash/isString';
import { useCallback } from 'react';
import { useLocation } from 'wouter';

export { RoutesContext, useRoutes, useUrlGenerator, RoutesProvider };

export const useRoutePush = () => {
    const url = useUrlGenerator();
    const [, navigate] = useLocation();
    const push = useCallback(
        (route, data, ...args) => {
            if (isString(route)) {
                navigate(url(route, data), ...args);
            } else {
                const { pathname = null, search = null } = route || {};
                navigate(`${url(pathname, data)}${search !== null ? `?${search}` : ''}`, ...args);
            }
        },
        [navigate, url],
    );
    return push;
};

export const useRouteBack = () => {
    const url = useUrlGenerator();
    const [, navigate] = useLocation();
    const back = useCallback(() => navigate(-1), [navigate, url]);
    return back;
};
