import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import UrlGenerator from '../lib/UrlGenerator';

export const UrlGeneratorContext = React.createContext(null);

export const useUrlGenerator = () => useContext(UrlGeneratorContext);

const propTypes = {
    children: PropTypes.node.isRequired,
    routes: PropTypes.objectOf(PropTypes.string),
    urlGenerator: PropTypes.instanceOf(UrlGenerator),
};

const defaultProps = {
    routes: null,
    urlGenerator: null,
};

const UrlGeneratorProvider = ({ children, routes, urlGenerator }) => {
    const value = useMemo(() => (urlGenerator !== null ? urlGenerator : new UrlGenerator(routes)), [
        routes,
        urlGenerator,
    ]);
    return (
        <UrlGeneratorContext.Provider value={value}>{children}</UrlGeneratorContext.Provider>
    );
};

UrlGeneratorProvider.propTypes = propTypes;
UrlGeneratorProvider.defaultProps = defaultProps;

export { UrlGeneratorProvider };

export default UrlGeneratorContext;
