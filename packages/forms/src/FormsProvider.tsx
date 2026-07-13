import { ElementType, type ReactNode } from 'react';

import { FormDefinition } from '@panneau/core';
import {
    FormsProvider as BaseFormsProvider,
    ComponentsProvider,
    FORMS_NAMESPACE,
} from '@panneau/core/contexts';

import * as components from './components';
import definitions from './definitions';

interface FormsProviderProps {
    definitions?: FormDefinition[];
    components?: Record<string, ElementType>;
    children: ReactNode;
}

const DEFAULT_DEFINITIONS: FormDefinition[] = [];
const DEFAULT_COMPONENTS: Record<string, ElementType> = {};

function FormsProvider({
    definitions: injectedDefinitions = DEFAULT_DEFINITIONS,
    components: injectedComponents = DEFAULT_COMPONENTS,
    children,
}: FormsProviderProps) {
    return (
        <BaseFormsProvider forms={[...definitions, ...injectedDefinitions]}>
            <ComponentsProvider
                namespace={FORMS_NAMESPACE}
                components={{ ...components, ...injectedComponents }}
            >
                {children}
            </ComponentsProvider>
        </BaseFormsProvider>
    );
}

export default FormsProvider;
