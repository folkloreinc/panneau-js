/* eslint-disable react/jsx-props-no-spreading */
import isString from 'lodash-es/isString';
import uniqBy from 'lodash-es/uniqBy';
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';

import { FieldsManager, PropTypes as PanneauPropTypes } from '../lib';

import { ComponentsProvider, FIELDS_NAMESPACE } from './ComponentsContext';

export const FieldsContext = React.createContext(null);

export const useFieldsManager = () => useContext(FieldsContext);

export const useField = (id) => {
    const manager = useFieldsManager();
    return manager.getDefinition(id);
};

export const useFields = () => {
    const manager = useFieldsManager();
    return manager.getDefinitions();
};

const propTypes = {
    fields: PanneauPropTypes.fields,
    manager: PropTypes.instanceOf(FieldsManager),
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    fields: null,
    manager: null,
};

export const FieldsProvider = ({ fields, manager, children }) => {
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
};

FieldsProvider.propTypes = propTypes;
FieldsProvider.defaultProps = defaultProps;
