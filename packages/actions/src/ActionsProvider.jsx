/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ACTIONS_NAMESPACE, ComponentsProvider } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node,
};

const defaultProps = {
    components: null,
    children: null,
};

const ActionsProviders = ({ components: injectedComponents, children, ...props }) => (
    <ComponentsProvider
        namespace={ACTIONS_NAMESPACE}
        components={{ ...components, ...injectedComponents }}
        {...props}
    >
        {children}
    </ComponentsProvider>
);

ActionsProviders.propTypes = propTypes;
ActionsProviders.defaultProps = defaultProps;

export default ActionsProviders;
