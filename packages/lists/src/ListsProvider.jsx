/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ComponentsProvider, LISTS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node,
};

function ListsProvider({
    components: injectedComponents = null,
    children = null,
    ...props
}) {
    return (
        <ComponentsProvider
            namespace={LISTS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
            {...props}
        >
            {children}
        </ComponentsProvider>
    );
}

ListsProvider.propTypes = propTypes;

export default ListsProvider;
