/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

const propTypes = {};

const TextareaField = (props) => <InputField {...props} type="textarea" />;

TextareaField.propTypes = propTypes;

export default TextareaField;
