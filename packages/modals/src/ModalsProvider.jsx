/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ComponentsProvider, MODALS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './modals';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node,
};

const defaultProps = {
    components: null,
    children: null,
};

const ModalsProvider = ({ components: injectedComponents, children, ...props }) => (
    <ComponentsProvider
        namespace={MODALS_NAMESPACE}
        components={{ ...components, ...injectedComponents }}
        {...props}
    >
        {children}
    </ComponentsProvider>
);

ModalsProvider.propTypes = propTypes;
ModalsProvider.defaultProps = defaultProps;

export default ModalsProvider;
