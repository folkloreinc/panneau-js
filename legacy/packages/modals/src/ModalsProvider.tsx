import { ReactNode } from 'react';

import { ComponentsProvider, MODALS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

interface ModalsProviderProps {
    components?: Record<string, unknown> | null;
    children?: ReactNode;
}

function ModalsProvider({
    components: injectedComponents = null,
    children = null,
    ...props
}: ModalsProviderProps) {
    return (
        <ComponentsProvider
            namespace={MODALS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
            {...props}
        >
            {children}
        </ComponentsProvider>
    );
}

export default ModalsProvider;
