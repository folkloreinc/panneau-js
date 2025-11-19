/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

interface GoogleKeysContextValue {
    apiKey: string | null;
}

export const GoogleKeysContext = React.createContext<GoogleKeysContextValue>({
    apiKey: null,
});

export const useGoogleKeys = (): GoogleKeysContextValue => useContext(GoogleKeysContext);

interface GoogleKeysProviderProps {
    children: ReactNode;
    apiKey?: string | null;
}

function GoogleKeysProvider({ children, apiKey = null }: GoogleKeysProviderProps) {
    const { apiKey: previousApiKey } = useGoogleKeys();
    const value = useMemo(() => ({ apiKey: apiKey || previousApiKey }), [previousApiKey, apiKey]);
    return <GoogleKeysContext.Provider value={value}>{children}</GoogleKeysContext.Provider>;
}

export { GoogleKeysProvider };
