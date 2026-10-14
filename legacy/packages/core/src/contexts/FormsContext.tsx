import isString from 'lodash-es/isString';
import uniqBy from 'lodash-es/uniqBy';
import { createContext, use, useMemo } from 'react';
import type { ReactNode } from 'react';

import { FormsManager } from '../lib';

import type { FormDefinition } from '../types';
import { ComponentsProvider, FORMS_NAMESPACE } from './ComponentsContext';

export const FormsContext = createContext<FormsManager | null>(null);

export function useFormsManager(): FormsManager | null {
    return use(FormsContext);
}

export function useFormDefinition(id: string): FormDefinition | null {
    const manager = useFormsManager();
    return manager.getDefinition(id);
}

export function useFormDefinitions(): FormDefinition[] {
    const manager = useFormsManager();
    return manager.getDefinitions();
}

interface FormsProviderProps {
    forms?: FormDefinition[] | null;
    manager?: FormsManager | null;
    children: ReactNode;
}

function FormsProvider({ forms = null, manager = null, children }: FormsProviderProps) {
    const previousManager = useFormsManager() || null;

    const finalManager = useMemo(() => {
        const newForms = uniqBy(
            [
                ...(forms || []),
                ...(manager !== null ? manager.getDefinitions() : []),
                ...(previousManager !== null ? previousManager.getDefinitions() : []),
            ],
            ({ id }) => id,
        ).reverse();
        return new FormsManager(newForms);
    }, [previousManager, manager, forms]);

    const components = useMemo(() => {
        const newComponents = finalManager.getComponents();
        return Object.keys(newComponents).reduce((map, id) => {
            const component = newComponents[id];
            return isString(component)
                ? map
                : {
                      ...map,
                      [id]: component,
                  };
        }, {});
    }, [finalManager]);

    return (
        <FormsContext value={finalManager}>
            <ComponentsProvider namespace={FORMS_NAMESPACE} components={components}>
                {children}
            </ComponentsProvider>
        </FormsContext>
    );
}

export { FormsProvider };
