/* eslint-disable react/jsx-no-useless-fragment */
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    value: PropTypes.string,
};

const defaultProps = {
    value: null,
};

const Text = ({ value }) => <>{value}</>;

Text.propTypes = propTypes;
Text.defaultProps = defaultProps;

export default Text;
