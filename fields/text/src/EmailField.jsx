/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import TextField from './TextField';

const propTypes = {};

const defaultProps = {};

const EmailField = (props) => <TextField {...props} type="email" />;

EmailField.propTypes = propTypes;
EmailField.defaultProps = defaultProps;

export default EmailField;
