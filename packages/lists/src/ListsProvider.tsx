/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import { ComponentsProvider, LISTS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

interface ListsProviderProps {
    components?: Record<string, unknown> | null;
    children?: React.ReactNode;
}

function ListsProvider({
    components: injectedComponents = null,
    children = null,
    ...props
}: ListsProviderProps) {
    return (
        <ComponentsProvider
            namespace={LISTS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
            {...props}
        >
            {children}
        </ComponentsProvider>
    );
}

export default ListsProvider;
