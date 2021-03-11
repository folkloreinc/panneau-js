/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { loadGoogleApi } from '@folklore/services';

import { useGoogleKeys } from './GoogleKeysContext';

export const GoogleApiClientContext = React.createContext(null);

export const useGoogleApiClient = () => useContext(GoogleApiClientContext);

export const withGoogleApiClient = WrappedComponent => {
    const getDisplayName = ({ displayName = null, name = null }) =>
        displayName || name || 'Component';

    const WithGoogleApiClientComponent = props => (
        <GoogleApiClientContext.Consumer>
            {client => <WrappedComponent googleApiClient={client} {...props} />}
        </GoogleApiClientContext.Consumer>
    );
    WithGoogleApiClientComponent.displayName = `WithGoogleApiClient(${getDisplayName(
        WrappedComponent,
    )})`;
    return WithGoogleApiClientComponent;
};

const propTypes = {
    children: PropTypes.node.isRequired,
};

const defaultProps = {};

export const GoogleApiClientProvider = ({ children }) => {
    const { apiKey } = useGoogleKeys();
    const [client, setClient] = useState(null);
    useEffect(() => {
        loadGoogleApi()
            .then(gapi =>
                gapi.client
                    .init({
                        apiKey,
                    })
                    .then(() => gapi),
            )
            .then(gapi => setClient(gapi));
    }, [apiKey, setClient]);
    return (
        <GoogleApiClientContext.Provider value={client}>{children}</GoogleApiClientContext.Provider>
    );
};

GoogleApiClientProvider.propTypes = propTypes;
GoogleApiClientProvider.defaultProps = defaultProps;
