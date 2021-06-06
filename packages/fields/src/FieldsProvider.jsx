/* eslint-disable react/jsx-props-no-spreading */
import {
    ComponentsProvider,
    FieldsProvider as BaseFieldsProvider,
    FIELDS_NAMESPACE,
} from '@panneau/core/contexts';
import PropTypes from 'prop-types';
import React from 'react';
import * as components from './components';
import definitions from './definitions';

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
    <BaseFieldsProvider fields={[...definitions, ...injectedDefinitions]}>
        <ComponentsProvider
            namespace={FIELDS_NAMESPACE}
            components={{ ...components, ...injectedComponents }}
        >
            {children}
        </ComponentsProvider>
    </BaseFieldsProvider>
);

FieldsProvider.propTypes = propTypes;
FieldsProvider.defaultProps = defaultProps;

export default FieldsProvider;
