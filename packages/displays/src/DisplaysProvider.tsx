import React from 'react';

import { ComponentsProvider, DISPLAYS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

interface DisplaysProviderProps {
    components?: Record<string, unknown> | null;
    children?: React.ReactNode;
}

function DisplaysProvider({
    components: injectedComponents = null,
    children = null,
    ...props
}: DisplaysProviderProps) {
    return (
        <ComponentsProvider
            namespace={DISPLAYS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
            {...props}
        >
            {children}
        </ComponentsProvider>
    );
}

export default DisplaysProvider;
