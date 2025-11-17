import classNames from 'classnames';
import PropTypes from 'prop-types';
import Switch from 'rc-switch';
import React, { useCallback, useMemo } from 'react';

import styles from './styles.module.css';
import 'rc-switch/assets/index.css';

const propTypes = {
    value: PropTypes.bool,
    name: PropTypes.string,
    queryValue: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

function ToggleField({
    value = null,
    queryValue = null,
    name = null,
    disabled = false,
    className = null,
    onChange = null
}) {
    const isTrue = useMemo(
        () =>
            queryValue !== null
                ? value === queryValue
                : value === true || value === 'true' || value === 1 || value === '1',
        [value, queryValue],
    );
    const finalOnChange = useCallback(
        (val) => {
            if (queryValue !== null) {
                if (val === true) {
                    onChange(queryValue);
                } else {
                    onChange(null);
                }
            } else {
                onChange(val);
            }
        },
        [onChange],
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    disabled,
                    [className]: className !== null,
                },
            ])}
        >
            <Switch name={name} checked={isTrue} onChange={finalOnChange} disabled={disabled} />
        </div>
    );
}

ToggleField.propTypes = propTypes;

export default ToggleField;
