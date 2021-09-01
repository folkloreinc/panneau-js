import classNames from 'classnames';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.module.scss';

const propTypes = {
    prepend: PropTypes.node,
    children: PropTypes.node,
    append: PropTypes.node,
    size: PropTypes.oneOf([null, 'sm', 'lg']),
    className: PropTypes.string,
};

const defaultProps = {
    prepend: null,
    children: null,
    append: null,
    size: null,
    className: null,
};

const InputGroupField = ({ prepend, children, append, size, className }) => (
    <div
        className={classNames([
            'input-group',
            {
                [`input-group-${size}`]: size !== null,
            },
            styles.container,
            {
                [className]: className !== null,
            },
        ])}
    >
        {isString(prepend) ? <div className="input-group-text">{prepend}</div> : prepend}
        {children}
        {isString(append) ? <div className="input-group-text">{append}</div> : append}
    </div>
);

InputGroupField.propTypes = propTypes;
InputGroupField.defaultProps = defaultProps;

export default InputGroupField;
