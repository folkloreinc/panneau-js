/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';

export const GoogleKeysContext = React.createContext({
    apiKey: null,
});

export const useGoogleKeys = () => useContext(GoogleKeysContext);

const propTypes = {
    children: PropTypes.node.isRequired,
    apiKey: PropTypes.string, // .isRequired,
};

const defaultProps = {
    apiKey: null,
};

export const GoogleKeysProvider = ({ children, apiKey }) => {
    const { apiKey: previousApiKey } = useGoogleKeys();
    const value = useMemo(() => ({ apiKey: apiKey || previousApiKey }), [previousApiKey, apiKey]);
    return <GoogleKeysContext.Provider value={value}>{children}</GoogleKeysContext.Provider>;
};

GoogleKeysProvider.propTypes = propTypes;
GoogleKeysProvider.defaultProps = defaultProps;
