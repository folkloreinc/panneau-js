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
    definitions: PropTypes.array, // eslint-disable-line
    components: PropTypes.object, // eslint-disable-line
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    definitions: [],
    components: {},
};

const FieldsProvider = ({
    definitions: injectedDefinitions,
    components: injectedComponents,
    children,
}) => (
    <ComponentsProvider
        namespace={FIELDS_NAMESPACE}
        components={{ ...components, ...injectedComponents }}
    >
        <BaseFieldsProvider fields={[definitions, ...injectedDefinitions]}>
            {children}
        </BaseFieldsProvider>
    </ComponentsProvider>
);

FieldsProvider.propTypes = propTypes;
FieldsProvider.defaultProps = defaultProps;

export default FieldsProvider;
