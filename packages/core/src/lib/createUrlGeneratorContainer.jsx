import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';
import UrlGenerator from './UrlGenerator';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const childContextTypes = {
    urlGenerator: PropTypes.instanceOf(UrlGenerator),
};

export default function createUrlGeneratorContainer(selectRoutes, opts) {
    const routesSelector = selectRoutes || (props => props.routes);

    const options = {
        withRef: false,
        ...opts,
    };

    return (WrappedComponent) => {
        class UrlGeneratorContainer extends Component {

            static getWrappedInstance() {
                invariant(
                    options.withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the second argument of the createUrlGeneratorContainer() call.',
                );
                return this.wrappedInstance;
            }

            constructor(props) {
                super(props);

                const routes = routesSelector(props);

                this.state = {
                    urlGenerator: new UrlGenerator(routes),
                };
            }

            getChildContext() {
                return {
                    urlGenerator: this.state.urlGenerator,
                };
            }

            componentWillReceiveProps(nextProps) {
                const nextRoutes = routesSelector(nextProps);
                const routes = routesSelector(this.props);
                const routesChanged = (
                    JSON.stringify(nextRoutes) !== JSON.stringify(routes)
                );
                if (routesChanged) {
                    this.setState({
                        urlGenerator: new UrlGenerator(routes),
                    });
                }
            }

            render() {
                const props = {
                    ...this.props,
                    urlGenerator: this.state.urlGenerator,
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

        UrlGeneratorContainer.childContextTypes = childContextTypes;
        UrlGeneratorContainer.displayName = `UrlGeneratorContainer(${getDisplayName(WrappedComponent)})`;
        UrlGeneratorContainer.WrappedComponent = WrappedComponent;

        return hoistStatics(UrlGeneratorContainer, WrappedComponent);
    };
}
