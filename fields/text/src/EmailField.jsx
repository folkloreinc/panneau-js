/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

const propTypes = {};

const defaultProps = {};

const EmailField = (props) => <InputField {...props} type="email" />;

EmailField.propTypes = propTypes;
EmailField.defaultProps = defaultProps;

export default EmailField;
