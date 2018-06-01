import React, { Component } from 'react';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import * as PanneauPropTypes from './PropTypes';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const contextTypes = {
    definition: PanneauPropTypes.definition,
};

export default function withComponentsCollection(mapDefinitionToProps, opts) {
    const options = {
        withRef: false,
        ...opts,
    };

    const { withRef } = options;

    const defaultMapDefinitionToProps = definition => ({
        definition,
    });
    const finalMapDefinitionToProps = mapDefinitionToProps || defaultMapDefinitionToProps;

    return (WrappedComponent) => {
        class WithDefinitionCollection extends Component {
            static getWrappedInstance() {
                invariant(
                    withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the second argument of the withDefinitionCollection() call.',
                );
                return this.wrappedInstance;
            }

            render() {
                const props = {
                    ...this.props,
                    ...finalMapDefinitionToProps(
                        this.context.definition || null,
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

        WithDefinitionCollection.contextTypes = contextTypes;
        WithDefinitionCollection.displayName = `WithDefinitionCollection(${getDisplayName(WrappedComponent)})`;
        WithDefinitionCollection.WrappedComponent = WrappedComponent;

        return hoistStatics(WithDefinitionCollection, WrappedComponent);
    };
}
