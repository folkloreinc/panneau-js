/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ComponentsProvider, DISPLAYS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node,
};

const defaultProps = {
    components: null,
    children: null,
};

const IndexesProvider = ({ components: injectedComponents, children, ...props }) => (
    <ComponentsProvider
        namespace={DISPLAYS_NAMESPACE}
        components={{ ...components, ...injectedComponents }}
        {...props}
    >
        {children}
    </ComponentsProvider>
);

IndexesProvider.propTypes = propTypes;
IndexesProvider.defaultProps = defaultProps;

export default IndexesProvider;
