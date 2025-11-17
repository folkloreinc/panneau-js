/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

const propTypes = {};

function PasswordField(props) {
    return <InputField {...props} type="password" />;
}

PasswordField.propTypes = propTypes;

export default PasswordField;
