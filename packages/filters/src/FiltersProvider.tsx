import { type ReactNode } from 'react';

import { ComponentsProvider, FILTERS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

interface FiltersProviderProps {
    components?: Record<string, unknown> | null;
    children?: ReactNode;
}

function FiltersProvider({
    components: injectedComponents = null,
    children = null,
    ...props
}: FiltersProviderProps) {
    return (
        <ComponentsProvider
            namespace={FILTERS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
            {...props}
        >
            {children}
        </ComponentsProvider>
    );
}

export default FiltersProvider;
