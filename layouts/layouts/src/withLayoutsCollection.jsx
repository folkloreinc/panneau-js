import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import defaultLayoutsCollection from './layouts';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    layoutsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

const defaultProps = {
    layoutsCollection: null,
};

const childContextTypes = {
    layoutsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

export default function withLayoutsCollection(opts) {
    const options = {
        withRef: false,
        layoutsCollection: defaultLayoutsCollection,
        ...opts,
    };
    return (WrappedComponent) => {
        class WithLayoutsCollection extends Component {
            static getWrappedInstance() {
                invariant(
                    options.withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the third argument of the withLayoutsCollection() call.',
                );

                return this.wrappedInstance;
            }

            constructor(props) {
                super(props);
                this.wrappedInstance = null;
            }

            getChildContext() {
                return {
                    layoutsCollection: options.layoutsCollection,
                };
            }

            render() {
                const props = {
                    ...this.props,
                    layoutsCollection: options.layoutsCollection,
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

        WithLayoutsCollection.propTypes = propTypes;
        WithLayoutsCollection.defaultProps = defaultProps;
        WithLayoutsCollection.childContextTypes = childContextTypes;
        WithLayoutsCollection.displayName = `withLayoutsCollection(${getDisplayName(WrappedComponent)})`;
        WithLayoutsCollection.WrappedComponent = WrappedComponent;

        const WithLayoutsCollectionComponent = hoistStatics(
            WithLayoutsCollection,
            WrappedComponent,
        );
        return WithLayoutsCollectionComponent;
    };
}
