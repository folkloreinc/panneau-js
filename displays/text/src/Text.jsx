/* eslint-disable react/jsx-no-useless-fragment */
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

function Text({
    value = null,
    placeholder = null
}) {
    return <>{value || placeholder}</>;
}

Text.propTypes = propTypes;

export default Text;
