/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ComponentsProvider, FORMS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node,
};

const defaultProps = {
    components: null,
    children: null,
};

const FormsProvider = ({ components: injectedComponents, children, ...props }) => (
    <ComponentsProvider
        namespace={FORMS_NAMESPACE}
        components={{ ...components, ...injectedComponents }}
        {...props}
    >
        {children}
    </ComponentsProvider>
);

FormsProvider.propTypes = propTypes;
FormsProvider.defaultProps = defaultProps;

export default FormsProvider;
