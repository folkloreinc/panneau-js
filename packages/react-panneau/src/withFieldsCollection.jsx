import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import defaultFieldsCollection from './fields/collection';
import FieldsCollection from './lib/FieldsCollection';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    fieldsCollection: PropTypes.instanceOf(FieldsCollection),
};

const defaultProps = {
    fieldsCollection: null,
};

const childContextTypes = {
    fieldsCollection: PropTypes.instanceOf(FieldsCollection),
};

export default function withFieldsCollection(WrappedComponent, fieldsCollection, opts) {
    const options = {
        withRef: false,
        defaultFieldsCollection,
        ...opts,
    };
    class WithFieldsCollection extends Component {
        static getWrappedInstance() {
            invariant(
                options.withRef,
                'To access the wrapped instance, you need to specify `{ withRef: true }` as the third argument of the withFieldsCollection() call.',
            );

            return this.wrappedInstance;
        }

        constructor(props) {
            super(props);
            this.wrappedInstance = null;
        }

        getChildContext() {
            return {
                fieldsCollection: (
                    this.props.fieldsCollection ||
                    fieldsCollection ||
                    options.defaultFieldsCollection
                ),
            };
        }

        render() {
            const props = {
                ...this.props,
            };
            if (options.withRef) {
                props.ref = (c) => {
                    this.wrappedInstance = c;
                };
            }

            return (
                <WrappedComponent
                    {...props}
                    fieldsCollection={fieldsCollection}
                />
            );
        }
    }

    WithFieldsCollection.propTypes = propTypes;
    WithFieldsCollection.defaultProps = defaultProps;
    WithFieldsCollection.childContextTypes = childContextTypes;
    WithFieldsCollection.displayName = `withFieldsCollection(${getDisplayName(WrappedComponent)})`;
    WithFieldsCollection.WrappedComponent = WrappedComponent;

    const WithFieldsCollectionComponent = hoistStatics(WithFieldsCollection, WrappedComponent);

    return WithFieldsCollectionComponent;
}
