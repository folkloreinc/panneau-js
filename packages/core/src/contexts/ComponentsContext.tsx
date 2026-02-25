import isString from 'lodash/isString';
import { createContext, useContext, useMemo } from 'react';
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

export const ComponentsContext = createContext<ComponentsManager | null>(null);

/**
 * Hooks
 */
export function useComponentsManager(namespace: string | null = null): ComponentsManager {
    const manager = useContext(ComponentsContext);
    const finalManager = useMemo(
        () =>
            namespace !== null ? new ComponentsManager(manager.getComponents(namespace)) : manager,
        [manager, namespace],
    );
    return finalManager;
}

export function useComponents(
    namespace: string | null = null,
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    const manager = useComponentsManager();
    return manager.getComponents(namespace) || defaultComponents;
}

export function useComponent(
    name: unknown,
    defaultComponent: unknown = null,
    namespace: string | null = null,
): unknown {
    const manager = useComponentsManager(namespace);
    return useMemo(() => {
        if (!isString(name)) {
            return name || defaultComponent;
        }
        return manager.getComponent(name) || defaultComponent;
    }, [manager, name, defaultComponent]);
}

/**
 * Fields hooks
 */
export function useFieldsComponentsManager(): ComponentsManager {
    return useComponentsManager(FIELDS_NAMESPACE);
}

export function useFieldsComponents(
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    return useComponents(FIELDS_NAMESPACE, defaultComponents);
}

export function useFieldComponent(name: unknown, defaultComponent: unknown = null): unknown {
    return useComponent(name, defaultComponent, FIELDS_NAMESPACE);
}

/**
 * Forms hooks
 */
export function useFormsComponentsManager(): ComponentsManager {
    return useComponentsManager(FORMS_NAMESPACE);
}

export function useFormsComponents(
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    return useComponents(FORMS_NAMESPACE, defaultComponents);
}

export function useFormComponent(name: unknown, defaultComponent: unknown = null): unknown {
    return useComponent(name, defaultComponent, FORMS_NAMESPACE);
}

/**
 * Modals hooks
 */
export function useModalsComponentsManager(): ComponentsManager {
    return useComponentsManager(MODALS_NAMESPACE);
}

export function useModalsComponents(
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    return useComponents(MODALS_NAMESPACE, defaultComponents);
}

export function useModalComponent(name: unknown, defaultComponent: unknown = null): unknown {
    return useComponent(name, defaultComponent, MODALS_NAMESPACE);
}

/**
 * Filters hooks
 */
export function useFiltersComponentsManager(): ComponentsManager {
    return useComponentsManager(FILTERS_NAMESPACE);
}

export function useFiltersComponents(
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    return useComponents(FILTERS_NAMESPACE, defaultComponents);
}

export function useFilterComponent(name: unknown, defaultComponent: unknown = null): unknown {
    return useComponent(name, defaultComponent, FILTERS_NAMESPACE);
}

/**
 * Lists hooks
 */
export function useListsComponentsManager(): ComponentsManager {
    return useComponentsManager(LISTS_NAMESPACE);
}

export function useListsComponents(
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    return useComponents(LISTS_NAMESPACE, defaultComponents);
}

export function useListComponent(name: unknown, defaultComponent: unknown = null): unknown {
    return useComponent(name, defaultComponent, LISTS_NAMESPACE);
}

/**
 * Displays hooks
 */
export function useDisplaysComponentsManager(): ComponentsManager {
    return useComponentsManager(DISPLAYS_NAMESPACE);
}

export function useDisplaysComponents(
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    return useComponents(DISPLAYS_NAMESPACE, defaultComponents);
}

export function useDisplayComponent(name: unknown, defaultComponent: unknown = null): unknown {
    return useComponent(name, defaultComponent, DISPLAYS_NAMESPACE);
}

/**
 * Actions hooks
 */
export function useActionsComponentsManager(): ComponentsManager {
    return useComponentsManager(ACTIONS_NAMESPACE);
}

export function useActionsComponents(
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    return useComponents(ACTIONS_NAMESPACE, defaultComponents);
}

export function useActionComponent(name: unknown, defaultComponent: unknown = null): unknown {
    return useComponent(name, defaultComponent, ACTIONS_NAMESPACE);
}

/**
 * Buttons hooks
 */
export function useButtonsComponentsManager(): ComponentsManager {
    return useComponentsManager(BUTTONS_NAMESPACE);
}

export function useButtonsComponents(
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    return useComponents(BUTTONS_NAMESPACE, defaultComponents);
}

export function useButtonComponent(name: unknown, defaultComponent: unknown = null): unknown {
    return useComponent(name, defaultComponent, BUTTONS_NAMESPACE);
}

/**
 * Pages hooks
 */
export function usePagesComponentsManager(): ComponentsManager {
    return useComponentsManager(PAGES_NAMESPACE);
}

export function usePagesComponents(
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    return useComponents(PAGES_NAMESPACE, defaultComponents);
}

export function usePageComponent(name: unknown, defaultComponent: unknown = null): unknown {
    return useComponent(name, defaultComponent, PAGES_NAMESPACE);
}

/**
 * Previews hooks
 */
export function usePreviewsComponentsManager(): ComponentsManager {
    return useComponentsManager(PREVIEWS_NAMESPACE);
}

export function usePreviewsComponents(
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    return useComponents(PREVIEWS_NAMESPACE, defaultComponents);
}

export function usePreviewComponent(name: unknown, defaultComponent: unknown = null): unknown {
    return useComponent(name, defaultComponent, PREVIEWS_NAMESPACE);
}

/**
 * App hooks
 */
export function useAppComponentsManager(): ComponentsManager {
    return useComponentsManager(APP_NAMESPACE);
}

export function useAppComponents(
    defaultComponents: Record<string, unknown> = {},
): Record<string, unknown> {
    return useComponents(APP_NAMESPACE, defaultComponents);
}

export function useAppComponent(name: unknown, defaultComponent: unknown = null): unknown {
    return useComponent(name, defaultComponent, APP_NAMESPACE);
}

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
    return <ComponentsContext value={finalManager}>{children}</ComponentsContext>;
}

export { ComponentsProvider };
