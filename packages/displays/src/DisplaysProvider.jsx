/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { ComponentsProvider, DISPLAYS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {
    children: null,
};

const IndexesProvider = (props) => (
    <ComponentsProvider namespace={DISPLAYS_NAMESPACE} components={components} {...props} />
);

IndexesProvider.propTypes = propTypes;
IndexesProvider.defaultProps = defaultProps;

export default IndexesProvider;
