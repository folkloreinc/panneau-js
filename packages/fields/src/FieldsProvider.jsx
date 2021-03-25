/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import {
    FIELDS_NAMESPACE,
    ComponentsProvider,
    FieldsProvider as BaseFieldsProvider,
} from '@panneau/core/contexts';

import definitions from './definitions';
import * as components from './components';

const propTypes = {
    children: PropTypes.node.isRequired,
};

const defaultProps = {};

const FieldsProvider = ({ children }) => (
    <ComponentsProvider namespace={FIELDS_NAMESPACE} components={components}>
        <BaseFieldsProvider fields={definitions}>{children}</BaseFieldsProvider>
    </ComponentsProvider>
);

FieldsProvider.propTypes = propTypes;
FieldsProvider.defaultProps = defaultProps;

export default FieldsProvider;
