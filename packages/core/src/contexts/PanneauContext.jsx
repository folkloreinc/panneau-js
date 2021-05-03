/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';

import * as PanneauPropTypes from '../lib/PropTypes';
import { isSet } from 'lodash-es';

const PanneauContext = React.createContext(null);

export const usePanneau = () => useContext(PanneauContext);

export const usePanneauResources = () => {
    const { resources = [] } = usePanneau();
    return resources;
};

export const usePanneauResource = (id) => {
    const resources = usePanneauResources();
    return resources.find((it) => it.id === id) || null;
};

export const usePanneauColorScheme = () => {
    const { theme = {} } = usePanneau();
    const { colorScheme = 'dark' } = theme || {};

    return colorScheme === 'dark'
        ? {
              background: 'dark',
              text: 'light',
          }
        : {
              background: 'light',
              text: 'dark',
          };
};

export const usePanneauComponents = () => {
    const { components = {} } = usePanneau();
    return components;
};

export const usePanneauComponent = (namespace, name) => {
    const { components = {} } = usePanneau();
    const path = namespace !== null ? `${namespace}.${name}` : name || null;
    const component = components[path] || null;

    if (isString(component)) {
        return component;
    }

    if (isObject(component) && isString(component?.componnent)) {
        const { component: innderComponent, ...props } = component;
        return component.component;
    }

    return null;
};

export const usePanneauAuth = () => {
    const { auth = {} } = usePanneau();
    return auth;
};

export const usePanneauSettings = () => {
    const { settings = {} } = usePanneau();
    return settings;
};

const propTypes = {
    definition: PanneauPropTypes.panneauDefinition.isRequired,
    children: PropTypes.node.isRequired,
};

const defaultProps = {};

export const PanneauProvider = ({ definition, children }) => (
    <PanneauContext.Provider value={definition}>{children}</PanneauContext.Provider>
);

PanneauProvider.propTypes = propTypes;
PanneauProvider.defaultProps = defaultProps;

export default PanneauContext;
