import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    labels: PropTypes.objectOf(PropTypes.string),
    value: PropTypes.string,
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

const defaultProps = {
    labels: {},
    value: null,
    placeholder: null,
};

const Label = ({ labels, value, placeholder }) => (
    <div>{labels[value] || value || placeholder}</div>
);

Label.propTypes = propTypes;
Label.defaultProps = defaultProps;

export default Label;
