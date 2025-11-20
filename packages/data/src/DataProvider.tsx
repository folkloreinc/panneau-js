import Api from './lib/Api';

import { ApiProvider } from './contexts/ApiContext';

interface DataProviderProps {
    api?: Api | null;
    apiBaseUrl?: string;
    children?: React.ReactNode;
}

function DataProvider({ api = null, apiBaseUrl = undefined, children = null }: DataProviderProps) {
    return (
        <ApiProvider api={api} baseUrl={apiBaseUrl}>
            {children}
        </ApiProvider>
    );
}

export default DataProvider;
