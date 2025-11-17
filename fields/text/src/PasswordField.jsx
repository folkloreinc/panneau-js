/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

const propTypes = {};

const PasswordField = (props) => <InputField {...props} type="password" />;

PasswordField.propTypes = propTypes;

export default PasswordField;
