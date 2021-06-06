/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import TextField from './TextField';

const propTypes = {};

const defaultProps = {};

const TextareaField = (props) => <TextField {...props} type="textarea" />;

TextareaField.propTypes = propTypes;
TextareaField.defaultProps = defaultProps;

export default TextareaField;
