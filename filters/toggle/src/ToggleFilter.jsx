/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Switch from 'rc-switch';
import React, { useCallback } from 'react';

import styles from './styles.module.scss';

import 'rc-switch/assets/index.css';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.bool,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    vertical: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    name: 'toggle',
    value: false,
    label: null,
    vertical: false,
    className: null,
};

const ToggleFilter = ({ name, value, label, vertical, onChange, onClear, className, ...props }) => {
    const isTrue =
        value !== null && (value === true || value === 'true' || value === 1 || value === '1');

    const onToggleChange = useCallback(
        (newValue) => {
            if (newValue === false && onClear !== null) {
                onClear();
            } else if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange, onClear],
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.vertical]: vertical,
                    [className]: className !== null,
                },
            ])}
        >
            {label !== null ? <span className="me-2">{label}</span> : null}
            <Switch {...props} name={name} checked={isTrue} onChange={onToggleChange} />
        </div>
    );
};

ToggleFilter.propTypes = propTypes;
ToggleFilter.defaultProps = defaultProps;

export default ToggleFilter;
