/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import {
    FieldsProvider as BaseFieldsProvider,
    ComponentsProvider,
    FIELDS_NAMESPACE,
} from '@panneau/core/contexts';

import * as components from './components';
import definitions from './definitions';

interface FieldsProviderProps {
    definitions?: unknown[];
    components?: Record<string, unknown>;
    children: React.ReactNode;
}

const DEFAULT_DEFINITIONS: unknown[] = [];
const DEFAULT_COMPONENTS: Record<string, unknown> = {};

function FieldsProvider({
    definitions: injectedDefinitions = DEFAULT_DEFINITIONS,
    components: injectedComponents = DEFAULT_COMPONENTS,
    children,
}: FieldsProviderProps) {
    return (
        <BaseFieldsProvider fields={[...definitions, ...injectedDefinitions]}>
            <ComponentsProvider
                namespace={FIELDS_NAMESPACE}
                components={{ ...components, ...injectedComponents }}
            >
                {children}
            </ComponentsProvider>
        </BaseFieldsProvider>
    );
}

export default FieldsProvider;
