import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import type { PanneauDefinition, Resource } from '../types';

const PanneauContext = createContext<PanneauDefinition | null>(null);

export const usePanneau = (): PanneauDefinition | null => useContext(PanneauContext);

const DEFAULT_RESOURCES: Resource[] = [];

export const usePanneauResources = (): Resource[] => {
    const { resources = DEFAULT_RESOURCES } = usePanneau() || {};
    return resources;
};

export const usePanneauResource = (id: string): Resource | null => {
    const resources = usePanneauResources();
    return resources.find((it) => it.id === id) || null;
};

export const usePanneauColorScheme = (): {
    theme: string;
    background: string | null;
    text: string | null;
} => {
    const { theme = null } = usePanneau() || {};
    const { colorScheme = 'light' } = theme || {};

    if (colorScheme === null || colorScheme === 'light' || colorScheme === 'dark') {
        return colorScheme === 'dark'
            ? {
                  theme: 'dark',
                  background: 'dark',
                  text: 'light',
              }
            : {
                  theme: 'light',
                  background: 'light',
                  text: 'dark',
              };
    }
    return {
        theme: colorScheme,
        background: null,
        text: null,
    };
};

const DEFAULT_COMPONENTS: Record<string, unknown> = {};

export const usePanneauComponents = (): Record<string, unknown> => {
    const { components = DEFAULT_COMPONENTS } = usePanneau() || {};
    return components;
};

export const usePanneauComponent = (namespace: string | null, name: string): string | null => {
    const { components = {} } = usePanneau() || {};
    const path = namespace !== null ? `${namespace}.${name}` : name || null;
    const component = components[path] || null;

    if (isString(component)) {
        return component;
    }

    if (isObject(component) && isString(component?.componnent)) {
        const { component: innerComponent, ...props } = component;
        return component.component;
    }

    return null;
};

export const usePanneauAuth = (): Record<string, unknown> => {
    const { auth = {} } = usePanneau() || {};
    return auth;
};

export const usePanneauSettings = (): Record<string, unknown> => {
    const { settings = {} } = usePanneau() || {};
    return settings;
};

interface PanneauProviderProps {
    definition: PanneauDefinition;
    children: ReactNode;
}

function PanneauProvider({ definition, children }: PanneauProviderProps) {
    return <PanneauContext value={definition}>{children}</PanneauContext>;
}

export { PanneauProvider };
export default PanneauContext;
