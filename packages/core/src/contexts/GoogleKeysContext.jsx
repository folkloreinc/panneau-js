/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';

export const GoogleKeysContext = React.createContext({
    apiKey: null,
});

export const useGoogleKeys = () => useContext(GoogleKeysContext);

const propTypes = {
    children: PropTypes.node.isRequired,
    apiKey: PropTypes.string,// .isRequired,
};

const defaultProps = {
    apiKey: null
};

export const GoogleKeysProvider = ({ children, apiKey }) => {
    const { apiKey: previousApiKey } = useGoogleKeys();
    return (
        <GoogleKeysContext.Provider
            value={{
                apiKey: apiKey || previousApiKey,
            }}
        >
            {children}
        </GoogleKeysContext.Provider>
    );
};

GoogleKeysProvider.propTypes = propTypes;
GoogleKeysProvider.defaultProps = defaultProps;
