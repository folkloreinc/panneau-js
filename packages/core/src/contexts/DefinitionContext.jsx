/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import * as PanneauPropTypes from '../lib/PropTypes';

const DefinitionContext = React.createContext(null);

export const useDefinitionContext = () => useContext(DefinitionContext);

export const useDefinition = () => {
    const { definition = null } = useDefinitionContext();
    return definition;
};

const propTypes = {
    definition: PanneauPropTypes.definition.isRequired,
    children: PropTypes.node.isRequired,
};

const defaultProps = {};

export const DefinitionProvider = ({ definition, children }) => (
    <DefinitionContext.Provider value={definition}>{children}</DefinitionContext.Provider>
);

DefinitionProvider.propTypes = propTypes;
DefinitionProvider.defaultProps = defaultProps;

export default DefinitionContext;
