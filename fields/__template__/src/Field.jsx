import React from 'react';
import { FormGroup } from 'react-panneau';

/**
 *  Class: TemplateField
 *
 *  @param {string,number,array} value
 *  @return {string} newValue
 */
const propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    label: null,
    value: null,
    onChange: null,
};

const TemplateField = ({
    label,
    name,
    ...other
}) => (
    <FormGroup
        className="form-group-template"
        name={name}
        label={label}
        {...other}
    >
        Template
    </FormGroup>
);

TemplateField.propTypes = propTypes;
TemplateField.defaultProps = defaultProps;

export default TemplateField;
