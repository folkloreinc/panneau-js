import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import defaultCollection from './items';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    formsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

const defaultProps = {
    formsCollection: null,
};

const childContextTypes = {
    formsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

export default function withFormsCollection(opts) {
    const options = {
        withRef: false,
        formsCollection: defaultCollection,
        ...opts,
    };
    return (WrappedComponent) => {
        class WithFormsCollection extends Component {
            static getWrappedInstance() {
                invariant(
                    options.withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the third argument of the withFormsCollection() call.',
                );

                return this.wrappedInstance;
            }

            constructor(props) {
                super(props);
                this.wrappedInstance = null;
            }

            getChildContext() {
                return {
                    formsCollection: options.formsCollection,
                };
            }

            render() {
                const props = {
                    ...this.props,
                    formsCollection: options.formsCollection,
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

        WithFormsCollection.propTypes = propTypes;
        WithFormsCollection.defaultProps = defaultProps;
        WithFormsCollection.childContextTypes = childContextTypes;
        WithFormsCollection.displayName = `withFormsCollection(${getDisplayName(WrappedComponent)})`;
        WithFormsCollection.WrappedComponent = WrappedComponent;

        const WithFormsCollectionComponent = hoistStatics(
            WithFormsCollection,
            WrappedComponent,
        );
        return WithFormsCollectionComponent;
    };
}
