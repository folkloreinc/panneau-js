import React, { Component } from 'react';
import invariant from 'invariant';
import get from 'lodash/get';
import hoistStatics from 'hoist-non-react-statics';

import * as PanneauPropTypes from './PropTypes';
import withUrlGenerator from './withUrlGenerator';
import withDefinition from './withDefinition';
import ResourceApi from './ResourceApi';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const contextTypes = {
    definition: PanneauPropTypes.definition,
};

export default function withComponentsCollection(selectResourceFromProps, opts) {
    const options = {
        withRef: false,
        ...opts,
    };

    const { withRef } = options;

    const defaultSelectResourceFromProps = ({ resource = null }) => resource;
    const finalSelectResourceFromProps = selectResourceFromProps || defaultSelectResourceFromProps;

    return (WrappedComponent) => {
        class WithResourceApi extends Component {
            static getWrappedInstance() {
                invariant(
                    withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the second argument of the withDefinitionCollection() call.',
                );
                return this.wrappedInstance;
            }

            constructor(props) {
                super(props);

                const resource = finalSelectResourceFromProps(props);
                const endpointHost = get(props.definition, 'endpointHost', '/');
                this.api = new ResourceApi(resource, props.urlGenerator, {
                    host: endpointHost,
                });
            }

            render() {
                const { ...otherProps } = this.props;
                const props = {
                    ...otherProps,
                    resourceApi: this.api,
                };

                if (withRef) {
                    props.ref = (c) => {
                        this.wrappedInstance = c;
                    };
                }

                return <WrappedComponent {...props} />;
            }
        }

        WithResourceApi.contextTypes = contextTypes;
        WithResourceApi.displayName = `WithResourceApi(${getDisplayName(
            WrappedComponent,
        )})`;
        WithResourceApi.WrappedComponent = WrappedComponent;

        const WithDefinition = withDefinition()(hoistStatics(WithResourceApi, WrappedComponent));
        const WithUrlGenerator = withUrlGenerator()(WithDefinition);
        return WithUrlGenerator;
    };
}
