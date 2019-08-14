import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import * as PanneauPropTypes from '../lib/PropTypes';
import Definition from '../lib/Definition';

export const DefinitionContext = React.createContext(new Definition());

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
