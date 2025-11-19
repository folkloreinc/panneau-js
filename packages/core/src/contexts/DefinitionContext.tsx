/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import type { ReactNode } from 'react';
import type { Definition } from '@panneau/core/types';

const DefinitionContext = React.createContext<Definition | null>(null);

export const useDefinitionContext = (): Definition | null => useContext(DefinitionContext);

export const useDefinition = (): Definition | null => {
    const definition = useDefinitionContext();
    return definition || null;
};

interface DefinitionProviderProps {
    definition: Definition;
    children: ReactNode;
}

function DefinitionProvider({ definition, children }: DefinitionProviderProps) {
    return <DefinitionContext.Provider value={definition}>{children}</DefinitionContext.Provider>;
}

export { DefinitionProvider };
export default DefinitionContext;
