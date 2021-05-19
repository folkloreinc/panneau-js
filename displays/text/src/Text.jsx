import React from 'react';
import PropTypes from 'prop-types';

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
