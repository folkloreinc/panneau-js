import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import defaultListsCollection from './lists';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    listsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

const defaultProps = {
    listsCollection: null,
};

const childContextTypes = {
    listsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

export default function withListsCollection(opts) {
    const options = {
        withRef: false,
        listsCollection: defaultListsCollection,
        ...opts,
    };
    return (WrappedComponent) => {
        class WithListsCollection extends Component {
            static getWrappedInstance() {
                invariant(
                    options.withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the third argument of the withListsCollection() call.',
                );

                return this.wrappedInstance;
            }

            constructor(props) {
                super(props);
                this.wrappedInstance = null;
            }

            getChildContext() {
                return {
                    listsCollection: options.listsCollection,
                };
            }

            render() {
                const props = {
                    ...this.props,
                    listsCollection: options.listsCollection,
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

        WithListsCollection.propTypes = propTypes;
        WithListsCollection.defaultProps = defaultProps;
        WithListsCollection.childContextTypes = childContextTypes;
        WithListsCollection.displayName = `withListsCollection(${getDisplayName(WrappedComponent)})`;
        WithListsCollection.WrappedComponent = WrappedComponent;

        const WithListsCollectionComponent = hoistStatics(
            WithListsCollection,
            WrappedComponent,
        );
        return WithListsCollectionComponent;
    };
}
