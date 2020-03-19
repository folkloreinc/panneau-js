import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import UrlGenerator from './UrlGenerator';

/**
 * UrlGenerator context
 */
export const UrlGeneratorContext = React.createContext(null);

/**
 * useUrlGenerator Hook
 */
export const useUrlGenerator = () => useContext(UrlGeneratorContext);

/**
 * withUrlGenerator HOC
 * NOTE: returns function to stay compatible with the old HOC
 */
export const withUrlGenerator = () => (WrappedComponent) => {
    const getDisplayName = ({ displayName = null, name = null }) => displayName || name || 'Component';

    const WithUrlGeneratorComponent = props => (
        <UrlGeneratorContext.Consumer>
            {urlGenerator => <WrappedComponent urlGenerator={urlGenerator} {...props} />}
        </UrlGeneratorContext.Consumer>
    );
    WithUrlGeneratorComponent.displayName = `WithUrlGenerator(${getDisplayName(
        WrappedComponent || {},
    )})`;
    return WithUrlGeneratorComponent;
};
/**
 * UrlGenerator Provider
 */
const propTypes = {
    children: PropTypes.node.isRequired,
    routes: PropTypes.objectOf(PropTypes.string),
    urlGenerator: PropTypes.instanceOf(UrlGenerator),
};

const defaultProps = {
    routes: null,
    urlGenerator: null,
};

export const UrlGeneratorProvider = ({ children, routes, urlGenerator }) => {
    const value = useMemo(() => (urlGenerator !== null ? urlGenerator : new UrlGenerator(routes)), [
        routes,
        urlGenerator,
    ]);
    return <UrlGeneratorContext.Provider value={value}>{children}</UrlGeneratorContext.Provider>;
};

UrlGeneratorProvider.propTypes = propTypes;
UrlGeneratorProvider.defaultProps = defaultProps;

export default UrlGeneratorContext;
