import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const contextTypes = {
    componentsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

export default function withComponentsCollection(
    mapCollectionToProps,
    opts,
) {
    const options = {
        withRef: false,
        ...opts,
    };

    const finalMapCollectionToProps = (
        mapCollectionToProps ||
        (collection => ({ componentsCollection: collection }))
    );

    return (WrappedComponent) => {
        class WithComponentsCollection extends Component {
            static getWrappedInstance() {
                invariant(
                    options.withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the second argument of the withComponentsCollection() call.',
                );
                return this.wrappedInstance;
            }

            render() {
                const { componentsCollection } = this.context;

                const props = {
                    ...this.props,
                    ...finalMapCollectionToProps(componentsCollection),
                };

                if (options.withRef) {
                    props.ref = (c) => {
                        this.wrappedInstance = c;
                    };
                }

                return <WrappedComponent {...props} />;
            }
        }

        WithComponentsCollection.contextTypes = contextTypes;
        WithComponentsCollection.displayName = `WithComponentsCollection(${getDisplayName(WrappedComponent)})`;
        WithComponentsCollection.WrappedComponent = WrappedComponent;

        return hoistStatics(WithComponentsCollection, WrappedComponent);
    };
}
