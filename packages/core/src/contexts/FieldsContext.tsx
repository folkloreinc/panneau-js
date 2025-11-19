/* eslint-disable react/jsx-props-no-spreading */
import isString from 'lodash-es/isString';
import uniqBy from 'lodash-es/uniqBy';
import React, { useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import type { Field } from '@panneau/core/types';

import { FieldsManager } from '../lib';

import { ComponentsProvider, FIELDS_NAMESPACE } from './ComponentsContext';

export const FieldsContext = React.createContext<FieldsManager | null>(null);

export const useFieldsManager = (): FieldsManager | null => useContext(FieldsContext);

export const useField = (id: string): Field | null => {
    const manager = useFieldsManager();
    return manager.getDefinition(id);
};

export const useFields = (): Field[] => {
    const manager = useFieldsManager();
    return manager.getDefinitions();
};

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
        <FieldsContext.Provider value={finalManager}>
            <ComponentsProvider namespace={FIELDS_NAMESPACE} components={components}>
                {children}
            </ComponentsProvider>
        </FieldsContext.Provider>
    );
}

export { FieldsProvider };
