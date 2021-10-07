/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

const propTypes = {};

const defaultProps = {};

const PasswordField = (props) => <InputField {...props} type="password" />;

PasswordField.propTypes = propTypes;
PasswordField.defaultProps = defaultProps;

export default PasswordField;
