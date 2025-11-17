/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ComponentsProvider, FORMS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node,
};

const FormsProvider = ({
    components: injectedComponents = null,
    children = null,
    ...props
}) => (
    <ComponentsProvider
        namespace={FORMS_NAMESPACE}
        components={{ ...components, ...injectedComponents }}
        {...props}
    >
        {children}
    </ComponentsProvider>
);

FormsProvider.propTypes = propTypes;

export default FormsProvider;
