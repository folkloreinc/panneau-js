/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDefinition, useComponents, useUrlGenerator } from '@panneau/core/contexts';

import { updateLayout as updateLayoutAction } from '../actions/LayoutActions';

const propTypes = {
    history: PanneauPropTypes.history.isRequired,
    updateLayout: PropTypes.func.isRequired,
};

const defaultProps = {};

const Layout = ({ updateLayout, history, ...props }) => {
    const urlGenerator = useUrlGenerator();
    const definition = useDefinition();
    const layoutsCollection = useComponents('layouts');
    const gotoHome = useCallback(() => history(urlGenerator.route('home')), [urlGenerator]);
    const gotoLink = useCallback(path => history(path), []);
    const gotoRoute = useCallback(name => history(urlGenerator.route(name)), [urlGenerator]);
    const { type: componentName = 'normal', ...layoutProps } = definition.layout();
    const LayoutComponent = layoutsCollection.getComponent(componentName);
    return LayoutComponent !== null ? (
        <LayoutComponent
            gotoHome={gotoHome}
            gotoLink={gotoLink}
            gotoRoute={gotoRoute}
            updateLayout={updateLayout}
            {...layoutProps}
            {...props}
        />
    ) : null;
};

Layout.propTypes = propTypes;
Layout.defaultProps = defaultProps;

const WithStateContainer = connect(
    ({ layout }) => ({
        ...layout,
    }),
    dispatch => ({
        updateLayout: layout => dispatch(updateLayoutAction(layout)),
    }),
)(Layout);
const WithRouterContainer = withRouter(WithStateContainer);
export default WithRouterContainer;
