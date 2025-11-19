/* eslint-disable react/jsx-props-no-spreading */
import isString from 'lodash-es/isString';
import React, { useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { ComponentsManager } from '../lib';

export const MODALS_NAMESPACE = 'modals';
export const FIELDS_NAMESPACE = 'fields';
export const FORMS_NAMESPACE = 'forms';
export const FILTERS_NAMESPACE = 'filters';
export const LISTS_NAMESPACE = 'lists';
export const DISPLAYS_NAMESPACE = 'displays';
export const ACTIONS_NAMESPACE = 'actions';
export const BUTTONS_NAMESPACE = 'buttons';
export const PAGES_NAMESPACE = 'pages';
export const PREVIEWS_NAMESPACE = 'previews';
export const APP_NAMESPACE = 'app';

export const ComponentsContext = React.createContext<ComponentsManager | null>(null);

/**
 * Hooks
 */
export const useComponentsManager = (namespace: string | null = null): ComponentsManager => {
    const manager = useContext(ComponentsContext);
    const finalManager = useMemo(
        () =>
            namespace !== null ? new ComponentsManager(manager.getComponents(namespace)) : manager,
        [manager, namespace],
    );
    return finalManager;
};

export const useComponents = (
    namespace: string | null = null,
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => {
    const manager = useComponentsManager();
    return manager.getComponents(namespace) || defaultComponents;
};

export const useComponent = (
    name: unknown,
    defaultComponent: unknown = null,
    namespace: string | null = null,
): unknown => {
    const manager = useComponentsManager(namespace);
    return useMemo(() => {
        if (!isString(name)) {
            return name || defaultComponent;
        }
        return manager.getComponent(name) || defaultComponent;
    }, [manager, name, defaultComponent]);
};

/**
 * Fields hooks
 */
export const useFieldsComponentsManager = (): ComponentsManager =>
    useComponentsManager(FIELDS_NAMESPACE);

export const useFieldsComponents = (
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => useComponents(FIELDS_NAMESPACE, defaultComponents);

export const useFieldComponent = (name: unknown, defaultComponent: unknown = null): unknown =>
    useComponent(name, defaultComponent, FIELDS_NAMESPACE);

/**
 * Forms hooks
 */
export const useFormsComponentsManager = (): ComponentsManager =>
    useComponentsManager(FORMS_NAMESPACE);

export const useFormsComponents = (
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => useComponents(FORMS_NAMESPACE, defaultComponents);

export const useFormComponent = (name: unknown, defaultComponent: unknown = null): unknown =>
    useComponent(name, defaultComponent, FORMS_NAMESPACE);

/**
 * Modals hooks
 */
export const useModalsComponentsManager = (): ComponentsManager =>
    useComponentsManager(MODALS_NAMESPACE);

export const useModalsComponents = (
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => useComponents(MODALS_NAMESPACE, defaultComponents);

export const useModalComponent = (name: unknown, defaultComponent: unknown = null): unknown =>
    useComponent(name, defaultComponent, MODALS_NAMESPACE);

/**
 * Filters hooks
 */
export const useFiltersComponentsManager = (): ComponentsManager =>
    useComponentsManager(FILTERS_NAMESPACE);

export const useFiltersComponents = (
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => useComponents(FILTERS_NAMESPACE, defaultComponents);

export const useFilterComponent = (name: unknown, defaultComponent: unknown = null): unknown =>
    useComponent(name, defaultComponent, FILTERS_NAMESPACE);

/**
 * Lists hooks
 */
export const useListsComponentsManager = (): ComponentsManager =>
    useComponentsManager(LISTS_NAMESPACE);

export const useListsComponents = (
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => useComponents(LISTS_NAMESPACE, defaultComponents);

export const useListComponent = (name: unknown, defaultComponent: unknown = null): unknown =>
    useComponent(name, defaultComponent, LISTS_NAMESPACE);

/**
 * Displays hooks
 */
export const useDisplaysComponentsManager = (): ComponentsManager =>
    useComponentsManager(DISPLAYS_NAMESPACE);

export const useDisplaysComponents = (
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => useComponents(DISPLAYS_NAMESPACE, defaultComponents);

export const useDisplayComponent = (name: unknown, defaultComponent: unknown = null): unknown =>
    useComponent(name, defaultComponent, DISPLAYS_NAMESPACE);

/**
 * Actions hooks
 */
export const useActionsComponentsManager = (): ComponentsManager =>
    useComponentsManager(ACTIONS_NAMESPACE);

export const useActionsComponents = (
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => useComponents(ACTIONS_NAMESPACE, defaultComponents);

export const useActionComponent = (name: unknown, defaultComponent: unknown = null): unknown =>
    useComponent(name, defaultComponent, ACTIONS_NAMESPACE);

/**
 * Buttons hooks
 */
export const useButtonsComponentsManager = (): ComponentsManager =>
    useComponentsManager(BUTTONS_NAMESPACE);

export const useButtonsComponents = (
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => useComponents(BUTTONS_NAMESPACE, defaultComponents);

export const useButtonComponent = (name: unknown, defaultComponent: unknown = null): unknown =>
    useComponent(name, defaultComponent, BUTTONS_NAMESPACE);

/**
 * Pages hooks
 */
export const usePagesComponentsManager = (): ComponentsManager =>
    useComponentsManager(PAGES_NAMESPACE);

export const usePagesComponents = (
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => useComponents(PAGES_NAMESPACE, defaultComponents);

export const usePageComponent = (name: unknown, defaultComponent: unknown = null): unknown =>
    useComponent(name, defaultComponent, PAGES_NAMESPACE);

/**
 * Previews hooks
 */
export const usePreviewsComponentsManager = (): ComponentsManager =>
    useComponentsManager(PREVIEWS_NAMESPACE);

export const usePreviewsComponents = (
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => useComponents(PREVIEWS_NAMESPACE, defaultComponents);

export const usePreviewComponent = (name: unknown, defaultComponent: unknown = null): unknown =>
    useComponent(name, defaultComponent, PREVIEWS_NAMESPACE);

/**
 * App hooks
 */
export const useAppComponentsManager = (): ComponentsManager => useComponentsManager(APP_NAMESPACE);

export const useAppComponents = (
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> => useComponents(APP_NAMESPACE, defaultComponents);

export const useAppComponent = (name: unknown, defaultComponent: unknown = null): unknown =>
    useComponent(name, defaultComponent, APP_NAMESPACE);

/**
 * Provider
 */
interface ComponentsProviderProps {
    children: ReactNode;
    namespace?: string | null;
    manager?: ComponentsManager | null;
    components?: Record<string, unknown>;
}

const DEFAULT_COMPONENTS = {};

function ComponentsProvider({
    components = DEFAULT_COMPONENTS,
    manager = null,
    namespace = null,
    children,
}: ComponentsProviderProps) {
    const previousManager = useComponentsManager() || null;
    const finalManager = useMemo(
        () =>
            new ComponentsManager({
                ...(previousManager !== null ? previousManager.getComponents() : null),
                ...(manager !== null ? manager.getComponents() : null),
                ...new ComponentsManager(components).addNamespace(namespace).getComponents(),
            }),
        [previousManager, manager, components, namespace],
    );
    return <ComponentsContext.Provider value={finalManager}>{children}</ComponentsContext.Provider>;
}

export { ComponentsProvider };
