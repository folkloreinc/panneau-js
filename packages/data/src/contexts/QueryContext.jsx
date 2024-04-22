/* eslint-disable react/jsx-props-no-spreading */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';

const QueryContext = React.createContext(null);

export const useQueryContext = () => useContext(QueryContext);

const propTypes = {
    config: PropTypes.shape({}),
    initialKey: PropTypes.arrayOf(PropTypes.string),
    initialData: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.arrayOf(PropTypes.shape({}))]),
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    config: null,
    initialKey: null,
    initialData: null,
};

export const QueryProvider = ({ config: initialConfig, initialKey, initialData, children }) => {
    const queryClient = useMemo(() => {
        const client = new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: Infinity,
                },
            },
            ...initialConfig,
        });
        if (initialKey !== null && initialData !== null) {
            client.setQueryData(initialKey, initialData);
        }
        return client;
    }, [initialConfig]);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

QueryProvider.propTypes = propTypes;
QueryProvider.defaultProps = defaultProps;

export default QueryContext;
