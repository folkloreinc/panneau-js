import { loadGoogleApi } from '@folklore/services';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';

import { useGoogleKeys } from './GoogleKeysContext';

export const GoogleApiClientContext = createContext<any | null>(null);

export const useGoogleApiClient = (): any | null => useContext(GoogleApiClientContext);

export const withGoogleApiClient = (WrappedComponent: ComponentType<any>) => {
    const getDisplayName = ({
        displayName = null,
        name = null,
    }: {
        displayName?: string | null;
        name?: string | null;
    }): string => displayName || name || 'Component';

    const WithGoogleApiClientComponent = (props: any) => (
        <GoogleApiClientContext.Consumer>
            {(client) => <WrappedComponent googleApiClient={client} {...props} />}
        </GoogleApiClientContext.Consumer>
    );
    WithGoogleApiClientComponent.displayName = `WithGoogleApiClient(${getDisplayName(
        WrappedComponent,
    )})`;
    return WithGoogleApiClientComponent;
};

interface GoogleApiClientProviderProps {
    children: ReactNode;
}

function GoogleApiClientProvider({ children }: GoogleApiClientProviderProps) {
    const { apiKey } = useGoogleKeys();
    const [client, setClient] = useState<any | null>(null);
    useEffect(() => {
        loadGoogleApi()
            .then((gapi) =>
                gapi.client
                    .init({
                        apiKey,
                    })
                    .then(() => gapi),
            )
            .then((gapi) => setClient(gapi));
    }, [apiKey, setClient]);
    return <GoogleApiClientContext value={client}>{children}</GoogleApiClientContext>;
}

export { GoogleApiClientProvider };
