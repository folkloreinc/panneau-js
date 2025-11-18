/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ComponentsProvider, MODALS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node,
};

function ModalsProvider({
    components: injectedComponents = null,
    children = null,
    ...props
}) {
    return (
        <ComponentsProvider
            namespace={MODALS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
            {...props}
        >
            {children}
        </ComponentsProvider>
    );
}

ModalsProvider.propTypes = propTypes;

export default ModalsProvider;
