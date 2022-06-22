/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Switch from 'rc-switch';
import React, { useCallback } from 'react';

import styles from './styles.module.scss';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    name: 'toggle',
    value: false,
    className: null,
};

const ToggleFilter = ({ name, value, onChange, onClear, className, ...props }) => {
    const isTrue =
        value !== null && (value === true || value === 'true' || value === 1 || value === '1');

    const onToggleChange = useCallback(
        (newValue) => {
            if (newValue) {
                onChange(newValue);
            } else {
                onClear();
            }
        },
        [onChange, onClear],
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
            <Switch {...props} name={name} checked={isTrue} onChange={onToggleChange} />
        </div>
    );
};

ToggleFilter.propTypes = propTypes;
ToggleFilter.defaultProps = defaultProps;

export default ToggleFilter;
