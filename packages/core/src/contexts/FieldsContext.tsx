import isString from 'lodash/isString';
import uniqBy from 'lodash/uniqBy';
import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { FieldsManager } from '../lib';

import type { Field } from '../types';
import { ComponentsProvider, FIELDS_NAMESPACE } from './ComponentsContext';

export const FieldsContext = createContext<FieldsManager | null>(null);

export function useFieldsManager(): FieldsManager | null {
    return useContext(FieldsContext);
}

export function useField(id: string): Field | null {
    const manager = useFieldsManager();
    return manager.getDefinition(id);
}

export function useFields(): Field[] {
    const manager = useFieldsManager();
    return manager.getDefinitions();
}

interface FieldsProviderProps {
    fields?: Field[] | null;
    manager?: FieldsManager | null;
    children: ReactNode;
}

function FieldsProvider({ fields = null, manager = null, children }: FieldsProviderProps) {
    const previousManager = useFieldsManager() || null;

    const finalManager = useMemo(() => {
        const newFields = uniqBy(
            [
                ...(fields || []),
                ...(manager !== null ? manager.getDefinitions() : []),
                ...(previousManager !== null ? previousManager.getDefinitions() : []),
            ],
            ({ id }) => id,
        ).reverse();
        return new FieldsManager(newFields);
    }, [previousManager, manager, fields]);

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
        <FieldsContext value={finalManager}>
            <ComponentsProvider namespace={FIELDS_NAMESPACE} components={components}>
                {children}
            </ComponentsProvider>
        </FieldsContext>
    );
}

export { FieldsProvider };
