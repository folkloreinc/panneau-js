/* eslint-disable react/jsx-no-useless-fragment */
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

const defaultProps = {
    value: null,
    placeholder: null,
};

const Text = ({ value = null, placeholder = null }) => <>{value || placeholder}</>;

Text.propTypes = propTypes;
Text.defaultProps = defaultProps;

export default Text;
