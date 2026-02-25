import { loadGoogleMaps } from '@folklore/services';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';

import { useGoogleKeys } from './GoogleKeysContext';

export const GoogleMapsClientContext = createContext<any | null>(null);

export function useGoogleMapsClient(): any | null {
    return useContext(GoogleMapsClientContext);
}

export function withGoogleMapsClient(WrappedComponent: ComponentType<any>) {
    function getDisplayName({
        displayName = null,
        name = null,
    }: {
        displayName?: string | null;
        name?: string | null;
    }): string {
        return displayName || name || 'Component';
    }

    function WithGoogleMapsClientComponent(props: any) {
        return (
            <GoogleMapsClientContext.Consumer>
                {(client) => <WrappedComponent googleApiClient={client} {...props} />}
            </GoogleMapsClientContext.Consumer>
        );
    }
    WithGoogleMapsClientComponent.displayName = `WithGoogleMapsClient(${getDisplayName(
        WrappedComponent,
    )})`;
    return WithGoogleMapsClientComponent;
}

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
