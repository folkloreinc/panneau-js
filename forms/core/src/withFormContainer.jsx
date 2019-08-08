import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import hoistStatics from 'hoist-non-react-statics';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

import { useForm, FormProvider } from './FormContext';
import * as FormPropTypes from './PropTypes';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    errors: FormPropTypes.errors,
    forwardRef: PanneauPropTypes.ref,
    onChange: PropTypes.func,
    onErrors: PropTypes.func,
};

const defaultProps = {
    value: null,
    errors: null,
    forwardRef: null,
    onChange: null,
    onErrors: null,
};

const withFormContainer = WrappedComponent => {
    const FormContainer = ({
        value: propsValue,
        errors: propsErrors,
        onChange,
        onErrors,
        forwardRef,
        ...props
    }) => {
        const [stateValue, setStateValue] = useState(propsValue);
        const [stateErrors, setStateErrors] = useState(propsErrors);
        const currentForm = useForm();
        const isValueControlled = onChange !== null;
        const isErrorsControlled = onErrors !== null;
        const value = isValueControlled ? propsValue : stateValue;
        const errors = isErrorsControlled ? propsErrors : stateErrors;

        const setValue = useCallback(
            newValue => {
                if (isValueControlled) {
                    onChange(newValue);
                } else {
                    setStateValue(newValue);
                }
            },
            [setStateValue, onChange],
        );

        const setErrors = useCallback(
            newErrors => {
                if (isErrorsControlled) {
                    onChange(newErrors);
                } else {
                    setStateErrors(newErrors);
                }
            },
            [setStateErrors, onChange],
        );

        const formContext = useMemo(
            () =>
                currentForm !== null
                    ? currentForm
                    : {
                          errors,
                          value,
                          setValue,
                          setErrors,
                      },
            [currentForm, errors, value],
        );

        const onFormChange = useCallback((newValue) => {
            setValue(newValue);
        }, [setValue]);

        const onFormErrors = useCallback((newErrors) => {
            setErrors(newErrors);
        }, [setErrors]);

        return (
            <FormProvider form={formContext}>
                <WrappedComponent
                    {...props}
                    ref={forwardRef}
                    value={value}
                    errors={errors}
                    setValue={setValue}
                    setErrors={setErrors}
                    onChange={onFormChange}
                    onErrors={onFormErrors}
                />
            </FormProvider>
        );
    };

    FormContainer.propTypes = propTypes;
    FormContainer.defaultProps = defaultProps;
    FormContainer.displayName = `FormContainer(${getDisplayName(WrappedComponent)})`;
    FormContainer.WrappedComponent = WrappedComponent;

    const HoistedFormContainer = hoistStatics(FormContainer, WrappedComponent);
    return React.forwardRef((props, ref) => <HoistedFormContainer {...props} forwardRef={ref} />);
};

export default withFormContainer;
