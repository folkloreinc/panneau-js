import isString from 'lodash-es/isString';
import { createContext, useContext, useMemo } from 'react';
import type { ElementType, ReactNode } from 'react';

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
    defaultComponents: Record<string, ElementType> = {},
): Record<string, ElementType> {
    const manager = useComponentsManager();
    return manager.getComponents(namespace) || defaultComponents;
}

export function useComponent(
    name: string | ElementType | null,
    defaultComponent: ElementType | null = null,
    namespace: string | null = null,
): ElementType | null {
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
export function useFieldsComponentsManager() {
    return useComponentsManager(FIELDS_NAMESPACE);
}

export function useFieldsComponents(defaultComponents = {}) {
    return useComponents(FIELDS_NAMESPACE, defaultComponents);
}

export function useFieldComponent(name, defaultComponent = null) {
    return useComponent(name, defaultComponent, FIELDS_NAMESPACE);
}

/**
 * Forms hooks
 */
export function useFormsComponentsManager() {
    return useComponentsManager(FORMS_NAMESPACE);
}

export function useFormsComponents(defaultComponents = {}) {
    return useComponents(FORMS_NAMESPACE, defaultComponents);
}

export function useFormComponent(name, defaultComponent = null) {
    return useComponent(name, defaultComponent, FORMS_NAMESPACE);
}

/**
 * Modals hooks
 */
export function useModalsComponentsManager() {
    return useComponentsManager(MODALS_NAMESPACE);
}

export function useModalsComponents(defaultComponents = {}) {
    return useComponents(MODALS_NAMESPACE, defaultComponents);
}

export function useModalComponent(name, defaultComponent = null) {
    return useComponent(name, defaultComponent, MODALS_NAMESPACE);
}

/**
 * Filters hooks
 */
export function useFiltersComponentsManager() {
    return useComponentsManager(FILTERS_NAMESPACE);
}

export function useFiltersComponents(defaultComponents = {}) {
    return useComponents(FILTERS_NAMESPACE, defaultComponents);
}

export function useFilterComponent(name, defaultComponent = null) {
    return useComponent(name, defaultComponent, FILTERS_NAMESPACE);
}

/**
 * Lists hooks
 */
export function useListsComponentsManager() {
    return useComponentsManager(LISTS_NAMESPACE);
}

export function useListsComponents(defaultComponents = {}) {
    return useComponents(LISTS_NAMESPACE, defaultComponents);
}

export function useListComponent(name, defaultComponent = null) {
    return useComponent(name, defaultComponent, LISTS_NAMESPACE);
}

/**
 * Displays hooks
 */
export function useDisplaysComponentsManager() {
    return useComponentsManager(DISPLAYS_NAMESPACE);
}

export function useDisplaysComponents(defaultComponents = {}) {
    return useComponents(DISPLAYS_NAMESPACE, defaultComponents);
}

export function useDisplayComponent(name, defaultComponent = null) {
    return useComponent(name, defaultComponent, DISPLAYS_NAMESPACE);
}

/**
 * Actions hooks
 */
export function useActionsComponentsManager() {
    return useComponentsManager(ACTIONS_NAMESPACE);
}

export function useActionsComponents(defaultComponents = {}) {
    return useComponents(ACTIONS_NAMESPACE, defaultComponents);
}

export function useActionComponent(name, defaultComponent = null) {
    return useComponent(name, defaultComponent, ACTIONS_NAMESPACE);
}

/**
 * Buttons hooks
 */
export function useButtonsComponentsManager() {
    return useComponentsManager(BUTTONS_NAMESPACE);
}

export function useButtonsComponents(defaultComponents = {}) {
    return useComponents(BUTTONS_NAMESPACE, defaultComponents);
}

export function useButtonComponent(name, defaultComponent = null) {
    return useComponent(name, defaultComponent, BUTTONS_NAMESPACE);
}

/**
 * Pages hooks
 */
export function usePagesComponentsManager() {
    return useComponentsManager(PAGES_NAMESPACE);
}

export function usePagesComponents(defaultComponents = {}) {
    return useComponents(PAGES_NAMESPACE, defaultComponents);
}

export function usePageComponent(name, defaultComponent = null) {
    return useComponent(name, defaultComponent, PAGES_NAMESPACE);
}

/**
 * Previews hooks
 */
export function usePreviewsComponentsManager() {
    return useComponentsManager(PREVIEWS_NAMESPACE);
}

export function usePreviewsComponents(defaultComponents = {}) {
    return useComponents(PREVIEWS_NAMESPACE, defaultComponents);
}

export function usePreviewComponent(name, defaultComponent = null) {
    return useComponent(name, defaultComponent, PREVIEWS_NAMESPACE);
}

/**
 * App hooks
 */
export function useAppComponentsManager() {
    return useComponentsManager(APP_NAMESPACE);
}

export function useAppComponents(defaultComponents = {}) {
    return useComponents(APP_NAMESPACE, defaultComponents);
}

export function useAppComponent(name, defaultComponent = null) {
    return useComponent(name, defaultComponent, APP_NAMESPACE);
}

/**
 * Provider
 */
interface ComponentsProviderProps {
    children: ReactNode;
    namespace?: string | null;
    manager?: ComponentsManager | null;
    components?: Record<string, ElementType>;
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
