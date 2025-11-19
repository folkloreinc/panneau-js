/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import { ComponentsProvider, FORMS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

interface FormsProviderProps {
    components?: Record<string, unknown> | null;
    children?: React.ReactNode;
}

function FormsProvider({
    components: injectedComponents = null,
    children = null,
    ...props
}: FormsProviderProps) {
    return (
        <ComponentsProvider
            namespace={FORMS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
            {...props}
        >
            {children}
        </ComponentsProvider>
    );
}

export default FormsProvider;
