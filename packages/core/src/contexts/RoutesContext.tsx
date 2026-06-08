import { RoutesContext, RoutesProvider, useRoutes, useUrlGenerator } from '@folklore/routes';
import isString from 'lodash-es/isString';
import { useCallback } from 'react';
import { useLocation } from 'wouter';

export { RoutesContext, useRoutes, useUrlGenerator, RoutesProvider };

export function useRoutePush(): (
    route: string | { pathname?: string | null; search?: string | null },
    data?: unknown,
    ...args: unknown[]
) => void {
    const url = useUrlGenerator();
    const [, navigate] = useLocation();
    const push = useCallback(
        (
            route: string | { pathname?: string | null; search?: string | null },
            data?: unknown,
            ...args: unknown[]
        ) => {
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
}

export function useRouteBack(): () => void {
    const url = useUrlGenerator();
    const [, navigate] = useLocation();
    const back = useCallback(() => navigate(-1), [navigate, url]);
    return back;
}
