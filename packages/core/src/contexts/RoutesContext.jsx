/* eslint-disable react/jsx-props-no-spreading */
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo } from 'react';
import { generatePath, useNavigate } from 'react-router';

export const RoutesContext = React.createContext(null);

export const useRoutes = () => {
    const { routes } = useContext(RoutesContext);
    return routes;
};

export const useUrlGenerator = () => {
    const { routes, basePath } = useContext(RoutesContext);

    const urlGenerator = useCallback(
        (key, data) => {
            // console.log('urlGenerator', basePath, routes, routes[key], data);
            const url = generatePath(routes[key], data);
            // console.log('url', url);
            return basePath !== null
                ? `${basePath.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
                : url;
        },
        [generatePath, routes, basePath],
    );
    return urlGenerator;
};

export const useRoutePush = () => {
    const url = useUrlGenerator();
    const navigate = useNavigate();
    const push = useCallback(
        (route, data, ...args) => {
            if (isString(route)) {
                navigate(url(route, data), ...args);
            } else {
                const { pathname = null, search = null } = route || {};
                // TODO: test this
                navigate({ pathname: url(pathname, data), search }, ...args);
            }
        },
        [navigate, url],
    );
    return push;
};

export const useRouteBack = () => {
    const url = useUrlGenerator();
    const navigate = useNavigate();
    const back = useCallback(() => navigate(-1), [navigate, url]);
    return back;
};

const propTypes = {
    children: PropTypes.node.isRequired,
    routes: PropTypes.objectOf(PropTypes.string), // .isRequired,
    basePath: PropTypes.string,
};

const defaultProps = {
    routes: null,
    basePath: null,
};

export const RoutesProvider = ({ routes, basePath, children }) => {
    const value = useMemo(
        () => ({
            routes,
            basePath,
        }),
        [routes, basePath],
    );
    // console.log(routes, basePath);
    return <RoutesContext.Provider value={value}>{children}</RoutesContext.Provider>;
};

RoutesProvider.propTypes = propTypes;
RoutesProvider.defaultProps = defaultProps;
