/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

const propTypes = {};

const defaultProps = {};

const TextareaField = (props) => <InputField {...props} type="textarea" />;

TextareaField.propTypes = propTypes;
TextareaField.defaultProps = defaultProps;

export default TextareaField;
