import { loadGoogleMaps } from '@folklore/services';
import React, { useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { useGoogleKeys } from './GoogleKeysContext';

export const GoogleMapsClientContext = React.createContext<any | null>(null);

export const useGoogleMapsClient = (): any | null => useContext(GoogleMapsClientContext);

export const withGoogleMapsClient = (WrappedComponent: React.ComponentType<any>) => {
    const getDisplayName = ({
        displayName = null,
        name = null,
    }: {
        displayName?: string | null;
        name?: string | null;
    }): string => displayName || name || 'Component';

    const WithGoogleMapsClientComponent = (props: any) => (
        <GoogleMapsClientContext.Consumer>
            {(client) => <WrappedComponent googleApiClient={client} {...props} />}
        </GoogleMapsClientContext.Consumer>
    );
    WithGoogleMapsClientComponent.displayName = `WithGoogleMapsClient(${getDisplayName(
        WrappedComponent,
    )})`;
    return WithGoogleMapsClientComponent;
};

interface GoogleMapsClientProviderProps {
    children: ReactNode;
    locale?: string;
    libraries?: string[] | null;
}

function GoogleMapsClientProvider({
    children,
    locale = 'fr',
    libraries = null,
}: GoogleMapsClientProviderProps) {
    const { apiKey } = useGoogleKeys();
    const exisitingClient = useGoogleMapsClient();
    const [client, setClient] = useState(exisitingClient);

    useEffect(() => {
        if (exisitingClient === null) {
            loadGoogleMaps({ apiKey, locale, libraries }).then((newClient: any) => {
                setClient(newClient);
            });
        }
    }, [apiKey, locale, libraries, setClient, exisitingClient]);

    return <GoogleMapsClientContext value={client}>{children}</GoogleMapsClientContext>;
}

export { GoogleMapsClientProvider };
