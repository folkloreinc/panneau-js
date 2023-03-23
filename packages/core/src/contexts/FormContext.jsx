/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';

const FormContext = React.createContext(null);

export const useForm = () => useContext(FormContext);

export const useFormValue = () => {
    const { value } = useForm();
    return value;
};

export const useFormSetValue = () => {
    const { setValue } = useForm();
    return setValue;
};

const propTypes = {
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setValue: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

const defaultProps = {};

export const FormProvider = ({ value, setValue, children }) => {
    const values = useMemo(
        () => ({
            value,
            setValue,
        }),
        [value, setValue],
    );
    return <FormContext.Provider value={values}>{children}</FormContext.Provider>;
};

FormProvider.propTypes = propTypes;
FormProvider.defaultProps = defaultProps;

export default FormContext;
