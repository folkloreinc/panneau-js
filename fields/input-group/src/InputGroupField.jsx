import classNames from 'classnames';
import isString from 'lodash-es/isString';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.module.css';

const propTypes = {
    prepend: PropTypes.node,
    children: PropTypes.node,
    append: PropTypes.node,
    size: PropTypes.oneOf([null, 'sm', 'lg']),
    className: PropTypes.string,
};

function InputGroupField({
    prepend = null,
    children = null,
    append = null,
    size = null,
    className = null
}) {
    return (
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
}

InputGroupField.propTypes = propTypes;

export default InputGroupField;
