/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { ComponentsProvider, MODALS_NAMESPACE } from '@panneau/core/contexts';

import ModalsComponents from './modals';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {
    children: null,
};

const ModalsProvider = (props) => (
    <ComponentsProvider namespace={MODALS_NAMESPACE} components={ModalsComponents} {...props} />
);

ModalsProvider.propTypes = propTypes;
ModalsProvider.defaultProps = defaultProps;

export default ModalsProvider;
