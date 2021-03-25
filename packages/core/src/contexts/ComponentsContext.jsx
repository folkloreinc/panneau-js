/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import isString from 'lodash/isString';

import { ComponentsManager } from '../lib';

export const MODALS_NAMESPACE = 'modals';
export const FIELDS_NAMESPACE = 'fields';
export const FORMS_NAMESPACE = 'forms';
export const FILTERS_NAMESPACE = 'filters';
export const LISTS_NAMESPACE = 'lists';

export const ComponentsContext = React.createContext(null);

/**
 * Hooks
 */
export const useComponentsManager = (namespace = null) => {
    const manager = useContext(ComponentsContext);
    const finalManager = useMemo(
        () =>
            namespace !== null ? new ComponentsManager(manager.getComponents(namespace)) : manager,
        [manager, namespace],
    );
    return finalManager;
};

export const useComponents = (namespace = null, defaultComponents = {}) => {
    const manager = useComponentsManager();
    return manager.getComponents(namespace) || defaultComponents;
};

export const useComponent = (name, defaultComponent = null, namespace = null) => {
    if (!isString(name)) {
        return name || defaultComponent;
    }
    const manager = useComponentsManager(namespace);
    return useMemo(() => manager.getComponent(name) || defaultComponent, [
        manager,
        name,
        defaultComponent,
    ]);
};

/**
 * Fields hooks
 */
export const useFieldsComponentsManager = () => useComponentsManager(FIELDS_NAMESPACE);

export const useFieldsComponents = (defaultComponents = {}) =>
    useComponents(FIELDS_NAMESPACE, defaultComponents);

export const useFieldComponent = (name, defaultComponent = null) =>
    useComponent(name, defaultComponent, FIELDS_NAMESPACE);

/**
 * Forms hooks
 */
export const useFormsComponentsManager = () => useComponentsManager(FORMS_NAMESPACE);

export const useFormsComponents = (defaultComponents = {}) =>
    useComponents(FORMS_NAMESPACE, defaultComponents);

export const useFormComponent = (name, defaultComponent = null) =>
    useComponent(name, defaultComponent, FORMS_NAMESPACE);

/**
 * Modals hooks
 */
export const useModalsComponentsManager = () => useComponentsManager(MODALS_NAMESPACE);

export const useModalsComponents = (defaultComponents = {}) =>
    useComponents(MODALS_NAMESPACE, defaultComponents);

export const useModalComponent = (name, defaultComponent = null) =>
    useComponent(name, defaultComponent, MODALS_NAMESPACE);

/**
 * Filters hooks
 */
export const useFiltersComponentsManager = () => useComponentsManager(FILTERS_NAMESPACE);

export const useFiltersComponents = (defaultComponents = {}) =>
    useComponents(FILTERS_NAMESPACE, defaultComponents);

export const useFilterComponent = (name, defaultComponent = null) =>
    useComponent(name, defaultComponent, FILTERS_NAMESPACE);

/**
 * Lists hooks
 */
export const useListsComponentsManager = () => useComponentsManager(LISTS_NAMESPACE);

export const useListsComponents = (defaultComponents = {}) =>
    useComponents(LISTS_NAMESPACE, defaultComponents);

export const useListComponent = (name, defaultComponent = null) =>
    useComponent(name, defaultComponent, LISTS_NAMESPACE);

/**
 * Provider
 */
const propTypes = {
    children: PropTypes.node.isRequired,
    namespace: PropTypes.string,
    manager: PropTypes.instanceOf(ComponentsManager),
    components: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.func])),
};

const defaultProps = {
    namespace: null,
    components: {},
    manager: null,
};

export const ComponentsProvider = ({ components, manager, namespace, children }) => {
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
};

ComponentsProvider.propTypes = propTypes;
ComponentsProvider.defaultProps = defaultProps;
