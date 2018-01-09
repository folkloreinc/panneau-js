import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import defaultFieldsCollection from './fields';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    fieldsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

const defaultProps = {
    fieldsCollection: null,
};

const childContextTypes = {
    fieldsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

export default function withFieldsCollection(opts) {
    const options = {
        withRef: false,
        fieldsCollection: defaultFieldsCollection,
        ...opts,
    };
    return (WrappedComponent) => {
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
                    fieldsCollection: options.fieldsCollection,
                };
            }

            render() {
                const props = {
                    ...this.props,
                    fieldsCollection: options.fieldsCollection,
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

        WithFieldsCollection.propTypes = propTypes;
        WithFieldsCollection.defaultProps = defaultProps;
        WithFieldsCollection.childContextTypes = childContextTypes;
        WithFieldsCollection.displayName = `withFieldsCollection(${getDisplayName(WrappedComponent)})`;
        WithFieldsCollection.WrappedComponent = WrappedComponent;

        const WithFieldsCollectionComponent = hoistStatics(WithFieldsCollection, WrappedComponent);

        return WithFieldsCollectionComponent;
    };
}
