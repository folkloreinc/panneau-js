import React, { Component } from 'react';
import { Provider } from 'react-redux';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';
import isEqual from 'lodash/isEqual';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function createStoreContainer(createStore, storeHasChanged, opts) {
    const storeChanged = storeHasChanged || ((props, nextProps) => isEqual(props, nextProps));
    const options = {
        withRef: false,
        ...opts,
    };

    return (WrappedComponent) => {
        class StoreContainer extends Component {

            static getWrappedInstance() {
                invariant(
                    options.withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the second argument of the createStoreContainer() call.',
                );
                return this.wrappedInstance;
            }

            constructor(props) {
                super(props);

                this.state = {
                    store: createStore(props),
                    storeKey: `store-${(new Date()).getTime()}`,
                };
            }

            componentWillReceiveProps(nextProps) {
                if (storeChanged(this.props, nextProps)) {
                    this.setState({
                        store: createStore(nextProps),
                        storeKey: `store-${(new Date()).getTime()}`,
                    });
                }
            }

            render() {
                const { store, storeKey } = this.state;
                const props = {
                    ...this.props,
                    store,
                };

                if (options.withRef) {
                    props.ref = (c) => {
                        this.wrappedInstance = c;
                    };
                }

                return (
                    <Provider store={store} key={storeKey}>
                        <WrappedComponent {...props} />
                    </Provider>
                );
            }
        }

        StoreContainer.displayName = `StoreContainer(${getDisplayName(WrappedComponent)})`;
        StoreContainer.WrappedComponent = WrappedComponent;

        return hoistStatics(StoreContainer, WrappedComponent);
    };
}
