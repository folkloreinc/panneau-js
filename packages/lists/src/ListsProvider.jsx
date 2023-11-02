/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ComponentsProvider, LISTS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node,
};

const defaultProps = {
    components: null,
    children: null,
};

const ListsProvider = ({ components: injectedComponents, children, ...props }) => (
    <ComponentsProvider
        namespace={LISTS_NAMESPACE}
        components={{ ...components, ...injectedComponents }}
        {...props}
    >
        {children}
    </ComponentsProvider>
);

ListsProvider.propTypes = propTypes;
ListsProvider.defaultProps = defaultProps;

export default ListsProvider;
