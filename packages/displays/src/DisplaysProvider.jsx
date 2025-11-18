/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ComponentsProvider, DISPLAYS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node,
};

function DisplaysProvider({
    components: injectedComponents = null,
    children = null,
    ...props
}) {
    return (
        <ComponentsProvider
            namespace={DISPLAYS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
            {...props}
        >
            {children}
        </ComponentsProvider>
    );
}

DisplaysProvider.propTypes = propTypes;

export default DisplaysProvider;
