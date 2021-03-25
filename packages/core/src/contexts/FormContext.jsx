/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';

const FormContext = React.createContext(null);

export const useForm = () => useContext(FormContext);

export const useFormValue = () => {
    const { value } = useForm();
    return value;
};

const propTypes = {
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setValue: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

const defaultProps = {};

export const FormProvider = ({ value, setValue, children }) => (
    <FormContext.Provider
        value={{
            value,
            setValue,
        }}
    >
        {children}
    </FormContext.Provider>
);

FormProvider.propTypes = propTypes;
FormProvider.defaultProps = defaultProps;

export default FormContext;
