/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import { ACTIONS_NAMESPACE, ComponentsProvider } from '@panneau/core/contexts';

import * as components from './components';

interface ActionsProvidersProps {
    components?: Record<string, unknown> | null;
    children?: React.ReactNode;
}

function ActionsProviders({
    components: injectedComponents = null,
    children = null,
    ...props
}: ActionsProvidersProps) {
    return (
        <ComponentsProvider
            namespace={ACTIONS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
            {...props}
        >
            {children}
        </ComponentsProvider>
    );
}

export default ActionsProviders;
