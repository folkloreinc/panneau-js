import React from 'react';
import PropTypes from 'prop-types';

import TextField from './TextField';

const propTypes = {
    step: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    step: null,
    min: null,
    max: null,
    readOnly: null,
};

const NumberField = props => <TextField type="number" {...props} />;

NumberField.propTypes = propTypes;
NumberField.defaultProps = defaultProps;

export default NumberField;
