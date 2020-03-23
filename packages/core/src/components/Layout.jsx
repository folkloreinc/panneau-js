import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

import { withUrlGenerator } from '@folklore/react-container';
import * as PanneauPropTypes from '../lib/PropTypes';
import withDefinition from '../lib/withDefinition';
import withLayoutsCollection from '../lib/withLayoutsCollection';

const propTypes = {
    urlGenerator: PanneauPropTypes.urlGenerator.isRequired,
    layoutsCollection: PanneauPropTypes.componentsCollection.isRequired,
    definition: PanneauPropTypes.definition.isRequired,
    gotoHome: PropTypes.func.isRequired,
    gotoLink: PropTypes.func.isRequired,
    gotoRoute: PropTypes.func.isRequired,
};

const defaultProps = {};

const Layout = ({
    urlGenerator, definition, layoutsCollection, ...props
}) => {
    const layoutDefinition = definition.layout || {};
    const componentName = layoutDefinition.type || 'normal';
    const LayoutComponent = layoutsCollection.getComponent(componentName);
    return LayoutComponent !== null ? (
        <LayoutComponent
            applicationDefinition={definition}
            definition={layoutDefinition}
            {...props}
        />
    ) : null;
};

Layout.propTypes = propTypes;
Layout.defaultProps = defaultProps;

const mapStateToProps = ({ layout }) => ({
    ...layout,
});
const mapDispatchToProps = (dispatch, { urlGenerator }) => ({
    gotoHome: () => dispatch(push(urlGenerator.route('home'))),
    gotoLink: path => dispatch(push(path)),
    gotoRoute: (...args) => dispatch(push(urlGenerator.route(...args))),
});
const WithStateContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(Layout);
const WithLayoutsContainer = withLayoutsCollection()(WithStateContainer);
const WithDefinitionContainer = withDefinition()(WithLayoutsContainer);
const WithUrlGeneratorContainer = withUrlGenerator(WithDefinitionContainer);
export default WithUrlGeneratorContainer;
