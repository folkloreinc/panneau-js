import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isString from 'lodash/isString';

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
        {prepend !== null ? (
            <div className="input-group-prepend">
                {isString(prepend) ? <div className="input-group-text">{prepend}</div> : prepend}
            </div>
        ) : null}
        {children}
        {append !== null ? (
            <div className="input-group-append">
                {isString(append) ? <div className="input-group-text">{append}</div> : append}
            </div>
        ) : null}
    </div>
);

InputGroupField.propTypes = propTypes;
InputGroupField.defaultProps = defaultProps;

export default InputGroupField;
