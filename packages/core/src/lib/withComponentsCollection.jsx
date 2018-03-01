import React, { Component } from 'react';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import PanneauPropTypes from './PropTypes';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    componentsCollection: PanneauPropTypes.componentsCollection,
};

const defaultProps = {
    componentsCollection: null,
};

const contextTypes = {
    componentsCollection: PanneauPropTypes.componentsCollection,
};

export default function withComponentsCollection(mapCollectionToProps, opts) {
    const options = {
        withRef: false,
        childContext: false,
        ...opts,
    };

    const { withRef, childContext } = options;

    const defaultMapCollectionToProps = (props, context) => ({
        componentsCollection: props.componentsCollection || context.componentsCollection || null,
    });
    const finalMapCollectionToProps = mapCollectionToProps || defaultMapCollectionToProps;

    const propsKeys = Object.keys(finalMapCollectionToProps({}, {}));
    const childContextTypes = childContext
        ? {
            ...propsKeys.reduce(
                (propsMap, propKey) => ({
                    ...propsMap,
                    [propKey]: PanneauPropTypes.componentsCollection,
                }),
                {},
            ),
        }
        : null;

    return (WrappedComponent) => {
        class WithComponentsCollection extends Component {
            static getWrappedInstance() {
                invariant(
                    withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the second argument of the withComponentsCollection() call.',
                );
                return this.wrappedInstance;
            }

            render() {
                const props = {
                    ...this.props,
                    ...finalMapCollectionToProps(
                        this.props,
                        this.context,
                    ),
                };

                if (withRef) {
                    props.ref = (c) => {
                        this.wrappedInstance = c;
                    };
                }

                return <WrappedComponent {...props} />;
            }
        }

        if (childContextTypes !== null) {
            WithComponentsCollection.prototype.getChildContext = function getChildContext() {
                return {
                    ...finalMapCollectionToProps(
                        this.props,
                        this.context,
                    ),
                };
            };
        }

        WithComponentsCollection.propTypes = propTypes;
        WithComponentsCollection.defaultProps = defaultProps;
        WithComponentsCollection.contextTypes = contextTypes;
        if (childContextTypes !== null) {
            WithComponentsCollection.childContextTypes = childContextTypes;
        }
        WithComponentsCollection.displayName = `WithComponentsCollection(${getDisplayName(WrappedComponent)})`;
        WithComponentsCollection.WrappedComponent = WrappedComponent;

        return hoistStatics(WithComponentsCollection, WrappedComponent);
    };
}
