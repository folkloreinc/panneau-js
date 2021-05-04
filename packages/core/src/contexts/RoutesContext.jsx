/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generatePath, useHistory } from 'react-router';
import isString from 'lodash/isString';

export const RoutesContext = React.createContext(null);

export const useRoutes = () => {
    const { routes } = useContext(RoutesContext);
    return routes;
};

export const useUrlGenerator = () => {
    const { routes, basePath } = useContext(RoutesContext);
    const urlGenerator = useCallback(
        (key, data) => {
            const url = generatePath(routes[key], data);
            console.log('urlGenerator', basePath, routes[key], url, data);
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
    const history = useHistory();
    const push = useCallback(
        (route, data, ...args) => {
            if (isString(route)) {
                history.push(url(route, data), ...args);
            } else {
                const { pathname = null, search = null } = route || {};
                history.push({ pathname: url(pathname, data), search }, ...args);
            }
        },
        [history, url],
    );
    return push;
};

export const useRouteBack = () => {
    const url = useUrlGenerator();
    const history = useHistory();
    const back = useCallback(() => history.goBack(), [history, url]);
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

export const RoutesProvider = ({ routes, basePath, children }) => (
    <RoutesContext.Provider value={{ routes, basePath }}>{children}</RoutesContext.Provider>
);

RoutesProvider.propTypes = propTypes;
RoutesProvider.defaultProps = defaultProps;
