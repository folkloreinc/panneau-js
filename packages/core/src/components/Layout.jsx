import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { withUrlGenerator } from '@folklore/react-app';

import * as PanneauPropTypes from '../lib/PropTypes';
import withDefinition from '../lib/withDefinition';
import withLayoutsCollection from '../lib/withLayoutsCollection';

const propTypes = {
    layoutsCollection: PanneauPropTypes.componentsCollection.isRequired,
    definition: PanneauPropTypes.definition.isRequired,
};

const defaultProps = {

};

const Layout = ({ definition, layoutsCollection, ...props }) => {
    const componentName = get(definition, 'layout.type', 'normal');
    const LayoutComponent = layoutsCollection.getComponent(componentName);
    return (
        <LayoutComponent
            definition={definition}
            {...props}
        />
    );
};

Layout.propTypes = propTypes;
Layout.defaultProps = defaultProps;

const mapStateToProps = ({ layout }) => ({
    ...layout,
});
const mapDispatchToProps = (dispatch, { urlGenerator }) => ({
    gotoHome: () => dispatch(push(urlGenerator.route('home'))),
    goto: path => dispatch(push(path)),
});
const WithStateContainer = connect(mapStateToProps, mapDispatchToProps)(Layout);
const WithLayoutsContainer = withLayoutsCollection()(WithStateContainer);
const mapDefinitionToProps = definition => ({
    definition: get(definition, 'layout', {}),
});
const WithDefinitionContainer = withDefinition(mapDefinitionToProps)(WithLayoutsContainer);
const WithUrlGeneratorContainer = withUrlGenerator()(WithDefinitionContainer);
export default WithUrlGeneratorContainer;
