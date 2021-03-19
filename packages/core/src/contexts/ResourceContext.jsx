/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import * as PanneauPropTypes from '../lib/PropTypes';

import baseUseResourceUrlGenerator from '../hooks/useResourceUrlGenerator';

const ResourceContext = React.createContext(null);

export const useResource = () => useContext(ResourceContext);

export const useResourceUrlGenerator = () => {
    const resource = useResource();
    return baseUseResourceUrlGenerator(resource);
};

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    children: PropTypes.node.isRequired,
};

const defaultProps = {};

export const ResourceProvider = ({ resource, children }) => (
    <ResourceContext.Provider value={resource}>{children}</ResourceContext.Provider>
);

ResourceProvider.propTypes = propTypes;
ResourceProvider.defaultProps = defaultProps;

export default ResourceContext;
