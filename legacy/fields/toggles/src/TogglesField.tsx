/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import { useCallback } from 'react';

import type { Toggle } from '@panneau/core';
import ToggleField from '@panneau/field-toggle';

import styles from './styles.module.css';

interface TogglesFieldProps {
    name?: string | null;
    value?: Record<string, boolean> | null;
    toggles?: Toggle[];
    disabled?: boolean;
    className?: string | null;
    onChange?: ((value: Record<string, boolean>) => void) | null;
}

const DEFAULT_TOGGLES: Toggle[] = [];

function TogglesField({
    name = null,
    value = null,
    toggles = DEFAULT_TOGGLES,
    disabled = false,
    onChange = null,
    className = null,
}: TogglesFieldProps) {
    const onToggleChange = useCallback(
        (key: string, newToggleValue: boolean | string | null) => {
            const newValue = {
                ...value,
                [key]: newToggleValue,
            };
            if (onChange !== null) {
                onChange(newValue as Record<string, boolean>);
            }
        },
        [value, onChange],
    );
    return (
        <div
            className={classNames([
                styles.container,
                'd-flex',
                'flex-column',
                {
                    disabled,
                    [className]: className !== null,
                },
            ])}
        >
            <ul className="list-group">
                {toggles.map(({ key: toggleKey, label: toggleLabel = null }) => (
                    <li key={`toggle-${toggleKey}`} className="list-group-item">
                        <label className="d-flex align-items-center">
                            <ToggleField
                                name={`${name}[${toggleKey}]`}
                                value={value !== null ? value[toggleKey] || false : false}
                                onChange={(newValue) => onToggleChange(toggleKey, newValue)}
                                disabled={disabled}
                            />
                            {toggleLabel ? <span className="ms-2">{toggleLabel}</span> : null}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TogglesField;
