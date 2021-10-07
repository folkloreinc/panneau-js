/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

const propTypes = {};

const defaultProps = {};

const TextField = (props) => <InputField {...props} type="text" />;

TextField.propTypes = propTypes;
TextField.defaultProps = defaultProps;

export default TextField;
