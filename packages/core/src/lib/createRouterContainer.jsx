import React, { Component } from 'react';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';
import {
    Router,
    browserHistory,
    createMemoryHistory,
} from 'react-router';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function createRouterContainer(
    selectRoutes,
    historyCreator,
    selectRenderProps,
    routesHasChanged,
    opts,
) {
    const options = {
        withRef: false,
        memoryRouter: false,
        ...opts,
    };

    const routesSelector = selectRoutes || (props => props.routes);

    const createHistory = historyCreator || (props => (
        typeof window === 'undefined' || props.memoryRouter || options.memoryRouter ?
            createMemoryHistory({
                initialEntries: props.url !== null ? [props.url] : [],
            }) : browserHistory
    ));

    const renderPropsSelector = selectRenderProps || (props => props.renderProps || null);

    const routesChanged = routesHasChanged || ((props, nextProps) => (
        routesSelector(props) !== routesSelector(nextProps)
    ));

    return (WrappedComponent) => {
        class RouterContainer extends Component {

            static getWrappedInstance() {
                invariant(
                    options.withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the second argument of the createRouterContainer() call.',
                );
                return this.wrappedInstance;
            }

            constructor(props) {
                super(props);

                this.state = {
                    routes: routesSelector(props),
                    history: createHistory(props),
                    routerKey: `router-${(new Date()).getTime()}`,
                };
            }

            componentWillReceiveProps(nextProps) {
                if (routesChanged(this.props, nextProps)) {
                    this.setState({
                        routes: routesSelector(nextProps),
                        routerKey: `router-${(new Date()).getTime()}`,
                    });
                }
            }

            renderRouter() {
                const {
                    routes,
                    history,
                    routerKey,
                } = this.state;

                const renderProps = renderPropsSelector(this.props);
                const routerProps = {
                    ...renderProps,
                    history,
                    routes,
                };

                return (
                    <Router
                        key={routerKey}
                        {...routerProps}
                    />
                );
            }

            render() {
                const { routes, history } = this.state;
                const router = this.renderRouter();

                const props = {
                    ...this.props,
                    router,
                    routes,
                    history,
                };

                if (options.withRef) {
                    props.ref = (c) => {
                        this.wrappedInstance = c;
                    };
                }

                return <WrappedComponent {...props} />;
            }
        }

        RouterContainer.displayName = `RouterContainer(${getDisplayName(WrappedComponent)})`;
        RouterContainer.WrappedComponent = WrappedComponent;

        return hoistStatics(RouterContainer, WrappedComponent);
    };
}
