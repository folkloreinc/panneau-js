import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { withUrlGenerator } from '@folklore/react-container';
import * as PanneauPropTypes from '../lib/PropTypes';
import withDefinition from '../lib/withDefinition';
import withLayoutsCollection from '../lib/withLayoutsCollection';

const propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func,
    }).isRequired,
    urlGenerator: PanneauPropTypes.urlGenerator.isRequired,
    layoutsCollection: PanneauPropTypes.componentsCollection.isRequired,
    definition: PanneauPropTypes.definition.isRequired,
};

const defaultProps = {};

const Layout = ({
    urlGenerator, definition, layoutsCollection, history, ...props
}) => {
    const layoutDefinition = definition.layout || {};
    const componentName = layoutDefinition.type || 'normal';
    const LayoutComponent = layoutsCollection.getComponent(componentName);
    const goToProps = {
        gotoHome: () => history.push(urlGenerator.route('home')),
        gotoLink: path => history.push(path),
        gotoRoute: (...args) => history.push(urlGenerator.route(...args)),
    };
    return LayoutComponent !== null ? (
        <LayoutComponent
            applicationDefinition={definition}
            definition={layoutDefinition}
            {...props}
            {...goToProps}
        />
    ) : null;
};

Layout.propTypes = propTypes;
Layout.defaultProps = defaultProps;

const mapStateToProps = ({ layout }) => ({
    ...layout,
});

const WithStateContainer = connect(mapStateToProps)(Layout);
const WithLayoutsContainer = withLayoutsCollection()(WithStateContainer);
const WithDefinitionContainer = withDefinition()(WithLayoutsContainer);
const WithUrlGeneratorContainer = withUrlGenerator(WithDefinitionContainer);
const WithRouterContainer = withRouter(WithUrlGeneratorContainer);
export default WithRouterContainer;
