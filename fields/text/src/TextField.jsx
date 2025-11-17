/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

const propTypes = {};

function TextField(props) {
    return <InputField {...props} type="text" />;
}

TextField.propTypes = propTypes;

export default TextField;
