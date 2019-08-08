import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import * as FormPropTypes from './PropTypes';

export const FormContext = React.createContext(null);

export const useForm = () => useContext(FormContext);

const propTypes = {
    children: PropTypes.node.isRequired,
    form: FormPropTypes.form.isRequired,
};

const defaultProps = {};

const FormProvider = ({ children, form }) => (
    <FormContext.Provider value={form}>{children}</FormContext.Provider>
);

FormProvider.propTypes = propTypes;
FormProvider.defaultProps = defaultProps;

export { FormProvider };

export default FormContext;
