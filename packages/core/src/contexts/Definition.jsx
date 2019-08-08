import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import * as PanneauPropTypes from '../lib/PropTypes';

export const DefinitionContext = React.createContext(null);

export const useDefinition = () => useContext(DefinitionContext);

const propTypes = {
    children: PropTypes.node.isRequired,
    definition: PanneauPropTypes.definition.isRequired,
};

export const DefinitionProvider = ({ children, definition }) => (
    <DefinitionContext.Provider value={definition}>{children}</DefinitionContext.Provider>
);

DefinitionProvider.propTypes = propTypes;

export default DefinitionContext;
