import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import collection from './fields/collection';
import FieldsCollection from './lib/FieldsCollection';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const childContextTypes = {
    fieldsCollection: PropTypes.instanceOf(FieldsCollection),
};

export default function withFieldsCollection(WrappedComponent, fieldsCollection, opts) {
    const options = {
        withRef: false,
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
                fieldsCollection: fieldsCollection || collection,
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
                <WrappedComponent {...props} />
            );
        }
    }

    WithFieldsCollection.childContextTypes = childContextTypes;
    WithFieldsCollection.displayName = `withFieldsCollection(${getDisplayName(WrappedComponent)})`;
    WithFieldsCollection.WrappedComponent = WrappedComponent;

    const WithFieldsCollectionComponent = hoistStatics(WithFieldsCollection, WrappedComponent);

    return WithFieldsCollectionComponent;
}
