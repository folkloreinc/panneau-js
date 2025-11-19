/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import { ApiProvider } from './contexts/ApiContext';
import Api from './lib/Api';

interface DataProviderProps {
    api?: Api | null;
    apiBaseUrl?: string;
    children?: React.ReactNode;
}

function DataProvider({
    api = null,
    apiBaseUrl = undefined,
    children = null,
}: DataProviderProps) {
    return (
        <ApiProvider api={api} baseUrl={apiBaseUrl}>
            {children}
        </ApiProvider>
    );
}

export default DataProvider;
