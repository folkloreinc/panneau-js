import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    labels: PropTypes.objectOf(PropTypes.string),
    value: PropTypes.string,
};

const defaultProps = {
    labels: {},
    value: null,
};

const Label = ({ labels, value }) => <div>{labels[value] || value}</div>;
Label.propTypes = propTypes;
Label.defaultProps = defaultProps;

export default Label;
