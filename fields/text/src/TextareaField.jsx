/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

const propTypes = {};

function TextareaField(props) {
    return <InputField {...props} type="textarea" />;
}

TextareaField.propTypes = propTypes;

export default TextareaField;
