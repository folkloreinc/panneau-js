import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import defaultModalsCollection from './modals';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    modalsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

const defaultProps = {
    modalsCollection: null,
};

const childContextTypes = {
    modalsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

export default function withModalsCollection(opts) {
    const options = {
        withRef: false,
        modalsCollection: defaultModalsCollection,
        ...opts,
    };
    return (WrappedComponent) => {
        class WithModalsCollection extends Component {
            static getWrappedInstance() {
                invariant(
                    options.withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the third argument of the withModalsCollection() call.',
                );

                return this.wrappedInstance;
            }

            constructor(props) {
                super(props);
                this.wrappedInstance = null;
            }

            getChildContext() {
                return {
                    modalsCollection: options.modalsCollection,
                };
            }

            render() {
                const props = {
                    ...this.props,
                    modalsCollection: options.modalsCollection,
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

        WithModalsCollection.propTypes = propTypes;
        WithModalsCollection.defaultProps = defaultProps;
        WithModalsCollection.childContextTypes = childContextTypes;
        WithModalsCollection.displayName = `withModalsCollection(${getDisplayName(WrappedComponent)})`;
        WithModalsCollection.WrappedComponent = WrappedComponent;

        const WithModalsCollectionComponent = hoistStatics(
            WithModalsCollection,
            WrappedComponent,
        );
        return WithModalsCollectionComponent;
    };
}
