import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    children: PropTypes.node,
};

const defaultProps = {
    prefix: null,
    suffix: null,
    children: null,
};

const InputGroup = ({ prefix, suffix, children }) =>
    prefix !== null || suffix !== null ? (
        <span className="input-group">
            {prefix !== null ? (
                <span className="input-group-prepend">
                    <span className="input-group-text">{prefix}</span>
                </span>
            ) : null}
            { children }
            {suffix !== null ? (
                <span className="input-group-append">
                    <span className="input-group-text">{suffix}</span>
                </span>
            ) : null}
        </span>
    ) : (
        children
    );

InputGroup.propTypes = propTypes;
InputGroup.defaultProps = defaultProps;

export default InputGroup;
