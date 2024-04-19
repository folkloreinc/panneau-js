/* eslint-disable react/jsx-props-no-spreading */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';

const QueryContext = React.createContext(null);

export const useQueryContext = () => useContext(QueryContext);

const propTypes = {
    config: PropTypes.shape({}),
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    config: null,
};

export const QueryProvider = ({ config: initialConfig, children }) => {
    const queryClient = useMemo(() => {
        const client = new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: Infinity,
                },
            },
            ...initialConfig,
        });
        // if (page !== null) {
        //     const query =
        //         window && !isEmpty(window.location.search)
        //             ? queryString.parse(window.location.search, {
        //                   arrayFormat: 'bracket',
        //               })
        //             : null;
        //     client.setQueryData(['pages', page.url, query], page);
        // }
        return client;
    }, [initialConfig]);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

QueryProvider.propTypes = propTypes;
QueryProvider.defaultProps = defaultProps;

export default QueryContext;
