/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ACTIONS_NAMESPACE, ComponentsProvider } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node,
};

function ActionsProviders({
    components: injectedComponents = null,
    children = null,
    ...props
}) {
    return (
        <ComponentsProvider
            namespace={ACTIONS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
            {...props}
        >
            {children}
        </ComponentsProvider>
    );
}

ActionsProviders.propTypes = propTypes;

export default ActionsProviders;
