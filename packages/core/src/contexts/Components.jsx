import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import ComponentsCollection from '../lib/ComponentsCollection';

export const ComponentsContext = React.createContext(new ComponentsCollection());

export const useComponents = (namespace = null, customComponents = null) => {
    const contextCollection = useContext(ComponentsContext);
    const collection = useMemo(() => {
        if (customComponents !== null) {
            return ComponentsCollection.make(customComponents);
        }
        return namespace !== null ? contextCollection.getCollection(namespace) : contextCollection;
    }, [namespace, customComponents, contextCollection]);
    return collection;
};

export const useComponent = (name = null, namespace = null, customComponents = null) => {
    const collection = useComponents(namespace, customComponents);
    const component = useMemo(() => collection.getComponent(
        name,
    ), [collection, name]);
    return component;
};

const propTypes = {
    children: PropTypes.node.isRequired,
    components: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])),
    collection: PropTypes.instanceOf(ComponentsCollection),
};

const defaultProps = {
    components: null,
    collection: null,
};

export const ComponentsProvider = ({ children, components, collection }) => {
    // const value = useMemo(
    //     () => (collection !== null ? collection : new ComponentsCollection(components)),
    //     [components, collection],
    // );
    const value = collection !== null ? collection : new ComponentsCollection(components);
    return <ComponentsContext.Provider value={value}>{children}</ComponentsContext.Provider>;
};

ComponentsProvider.propTypes = propTypes;
ComponentsProvider.defaultProps = defaultProps;

export default ComponentsContext;
