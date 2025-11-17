/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

const propTypes = {};

const TelephoneField = (props) => <InputField {...props} type="tel" />;

TelephoneField.propTypes = propTypes;

export default TelephoneField;
