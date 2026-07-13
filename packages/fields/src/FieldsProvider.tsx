import { ElementType, type ReactNode } from 'react';

import { FieldDefinition } from '@panneau/core';
import {
    FieldsProvider as BaseFieldsProvider,
    ComponentsProvider,
    FIELDS_NAMESPACE,
} from '@panneau/core/contexts';

import * as components from './components';
import definitions from './definitions';

interface FieldsProviderProps {
    definitions?: FieldDefinition[];
    components?: Record<string, ElementType>;
    children: ReactNode;
}

const DEFAULT_DEFINITIONS: FieldDefinition[] = [];
const DEFAULT_COMPONENTS: Record<string, ElementType> = {};

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
