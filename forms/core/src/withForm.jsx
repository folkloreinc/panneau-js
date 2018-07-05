import React, { Component } from 'react';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import * as FormPropTypes from './PropTypes';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const contextTypes = {
    form: FormPropTypes.form,
};

export default function withForm(opts) {
    const options = {
        withRef: false,
        ...opts,
    };
    const { withRef } = options;

    return (WrappedComponent) => {
        class WithForm extends Component {
            static getWrappedInstance() {
                invariant(
                    withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the second argument of the withForm() call.',
                );
                return this.wrappedInstance;
            }

            render() {
                const { form } = this.context;

                if (withRef) {
                    return (
                        <WrappedComponent
                            {...this.props}
                            form={form}
                            ref={(c) => {
                                this.wrappedInstance = c;
                            }}
                        />
                    );
                }

                return <WrappedComponent {...this.props} form={form} />;
            }
        }

        WithForm.contextTypes = contextTypes;
        WithForm.displayName = `withForm(${getDisplayName(WrappedComponent)})`;
        WithForm.WrappedComponent = WrappedComponent;

        return hoistStatics(WithForm, WrappedComponent);
    };
}
