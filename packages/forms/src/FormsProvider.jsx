/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { ComponentsProvider, FORMS_NAMESPACE } from '@panneau/core/contexts';

import * as components from './components';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {
    children: null,
};

const FormsProvider = (props) => (
    <ComponentsProvider namespace={FORMS_NAMESPACE} components={components} {...props} />
);

FormsProvider.propTypes = propTypes;
FormsProvider.defaultProps = defaultProps;

export default FormsProvider;
