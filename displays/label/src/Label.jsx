import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    labels: PropTypes.objectOf(PropTypes.string),
    value: PropTypes.string,
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

const DEFAULT_LABELS = {};

const Label = ({
    labels = DEFAULT_LABELS,
    value = null,
    placeholder = null
}) => (
    <div>{labels[value] || value || placeholder}</div>
);

Label.propTypes = propTypes;

export default Label;
