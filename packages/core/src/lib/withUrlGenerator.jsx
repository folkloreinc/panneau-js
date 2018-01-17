import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import UrlGenerator from './UrlGenerator';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const contextTypes = {
    urlGenerator: PropTypes.instanceOf(UrlGenerator),
};

export default function withUrlGenerator(opts) {
    const options = {
        withRef: false,
        ...opts,
    };
    return (WrappedComponent) => {
        class WithUrlGenerator extends Component {
            static getWrappedInstance() {
                invariant(
                    options.withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the second argument of the withUrlGenerator() call.',
                );
                return this.wrappedInstance;
            }

            render() {
                const {
                    urlGenerator,
                } = this.context;

                if (urlGenerator === null) {
                    return (
                        <WrappedComponent {...this.props} />
                    );
                }

                const props = {
                    ...this.props,
                    urlGenerator,
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

        WithUrlGenerator.contextTypes = contextTypes;
        WithUrlGenerator.displayName = `withUrlGenerator(${getDisplayName(WrappedComponent)})`;
        WithUrlGenerator.WrappedComponent = WrappedComponent;

        const WithUrlGeneratorComponent = hoistStatics(WithUrlGenerator, WrappedComponent);

        return WithUrlGeneratorComponent;
    };
}
