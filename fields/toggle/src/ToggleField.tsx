import classNames from 'classnames';
import Switch from 'rc-switch';
import React, { useCallback, useMemo } from 'react';

import styles from './styles.module.css';
import 'rc-switch/assets/index.css';

interface ToggleFieldProps {
    value?: boolean | string | number | null;
    name?: string | null;
    queryValue?: string | null;
    disabled?: boolean;
    className?: string | null;
    onChange?: ((value: boolean | string | null) => void) | null;
}

function ToggleField({
    value = null,
    queryValue = null,
    name = null,
    disabled = false,
    className = null,
    onChange = null
}: ToggleFieldProps) {
    const isTrue = useMemo(
        () =>
            queryValue !== null
                ? value === queryValue
                : value === true || value === 'true' || value === 1 || value === '1',
        [value, queryValue],
    );
    const finalOnChange = useCallback(
        (val: boolean) => {
            if (queryValue !== null) {
                if (val === true) {
                    onChange?.(queryValue);
                } else {
                    onChange?.(null);
                }
            } else {
                onChange?.(val);
            }
        },
        [onChange, queryValue],
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
            <Switch name={name || undefined} checked={isTrue} onChange={finalOnChange} disabled={disabled} />
        </div>
    );
}

export default ToggleField;
