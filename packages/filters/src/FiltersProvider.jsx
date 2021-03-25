/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { ComponentsProvider, FILTERS_NAMESPACE } from '@panneau/core/contexts';

import FilterComponents from './filters';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {
    children: null,
};

const FiltersProvider = (props) => (
    <ComponentsProvider namespace={FILTERS_NAMESPACE} components={FilterComponents} {...props} />
);

FiltersProvider.propTypes = propTypes;
FiltersProvider.defaultProps = defaultProps;

export default FiltersProvider;
