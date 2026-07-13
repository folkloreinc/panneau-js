import classNames from 'classnames';
import isString from 'lodash-es/isString';
import { type ReactNode } from 'react';

import { ControlSize } from '@panneau/core';

import styles from './styles.module.css';

interface InputGroupFieldProps {
    prepend?: ReactNode | null;
    children?: ReactNode | null;
    append?: ReactNode | null;
    size?: ControlSize;
    className?: string | null;
}

function InputGroupField({
    prepend = null,
    children = null,
    append = null,
    size = null,
    className = null,
}: InputGroupFieldProps) {
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

export default InputGroupField;
