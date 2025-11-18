/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ComponentsProvider, FILTERS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node,
};

function FiltersProvider({
    components: injectedComponents = null,
    children = null,
    ...props
}) {
    return (
        <ComponentsProvider
            namespace={FILTERS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
            {...props}
        >
            {children}
        </ComponentsProvider>
    );
}

FiltersProvider.propTypes = propTypes;

export default FiltersProvider;
