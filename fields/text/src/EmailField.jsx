/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

const propTypes = {};

function EmailField(props) {
    return <InputField {...props} type="email" />;
}

EmailField.propTypes = propTypes;

export default EmailField;
