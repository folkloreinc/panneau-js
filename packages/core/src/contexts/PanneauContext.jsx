/* eslint-disable react/jsx-props-no-spreading */
import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import * as PanneauPropTypes from '../lib/PropTypes';

const PanneauContext = React.createContext(null);

export const usePanneau = () => useContext(PanneauContext);

export const usePanneauResources = () => {
    const { resources = [] } = usePanneau() || {};
    return resources;
};

export const usePanneauResource = (id) => {
    const resources = usePanneauResources();
    return resources.find((it) => it.id === id) || null;
};

export const usePanneauColorScheme = () => {
    const { theme = {} } = usePanneau() || {};
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

export const usePanneauComponents = () => {
    const { components = {} } = usePanneau() || {};
    return components;
};

export const usePanneauComponent = (namespace, name) => {
    const { components = {} } = usePanneau() || {};
    const path = namespace !== null ? `${namespace}.${name}` : name || null;
    const component = components[path] || null;

    if (isString(component)) {
        return component;
    }

    if (isObject(component) && isString(component?.componnent)) {
        // eslint-disable-next-line no-unused-vars
        const { component: innerComponent, ...props } = component;
        return component.component;
    }

    return null;
};

export const usePanneauAuth = () => {
    const { auth = {} } = usePanneau() || {};
    return auth;
};

export const usePanneauSettings = () => {
    const { settings = {} } = usePanneau() || {};
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
