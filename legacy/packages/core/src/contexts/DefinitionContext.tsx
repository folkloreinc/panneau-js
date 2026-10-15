import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import type { Definition } from '../types';

const DefinitionContext = createContext<Definition | null>(null);

export function useDefinitionContext(): Definition | null {
    return useContext(DefinitionContext);
}

export function useDefinition(): Definition | null {
    const definition = useDefinitionContext();
    return definition || null;
}

interface DefinitionProviderProps {
    definition: Definition;
    children: ReactNode;
}

function DefinitionProvider({ definition, children }: DefinitionProviderProps) {
    return <DefinitionContext value={definition}>{children}</DefinitionContext>;
}

export { DefinitionProvider };
export default DefinitionContext;
