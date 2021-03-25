/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { ComponentsProvider, LISTS_NAMESPACE } from '@panneau/core/contexts';

import ListsComponents from './lists';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {
    children: null,
};

const ListsProvider = (props) => (
    <ComponentsProvider namespace={LISTS_NAMESPACE} components={ListsComponents} {...props} />
);

ListsProvider.propTypes = propTypes;
ListsProvider.defaultProps = defaultProps;

export default ListsProvider;
