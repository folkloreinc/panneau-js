/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import React, { useMemo } from 'react';

import type { SelectOption } from '@panneau/core/types';
import { getSelectOptions } from '@panneau/core/utils';

import styles from './styles.module.css';

interface CheckboxesFieldProps {
    name?: string | null;
    value?: string[] | null;
    options?: SelectOption[];
    disabled?: boolean;
    className?: string | null;
    onChange?: ((value: string[]) => void) | null;
}

const DEFAULT_OPTIONS: SelectOption[] = [];

function Checkboxes({
    name = null,
    value = null,
    options = DEFAULT_OPTIONS,
    disabled = false,
    className = null,
    onChange = null,
}: CheckboxesFieldProps) {
    const finalOptions = useMemo(() => getSelectOptions(options), [options]);
    return (
        <div
            className={classNames([
                styles.container,
                'btn-group',
                'btn-group-toggle',
                {
                    [styles.disabled]: disabled,
                    [className]: className !== null,
                },
            ])}
            data-toggle="buttons"
        >
            {finalOptions.map(({ value: optionValue, label }) => (
                <label
                    key={`radio-${optionValue}`}
                    className={classNames([
                        'btn',
                        'btn-outline-secondary',
                        {
                            active: value !== null && value.indexOf(optionValue) !== -1,
                        },
                    ])}
                >
                    <input
                        type="checkbox"
                        className={classNames(['btn-check', styles.btnCheck])}
                        name={`${name}[]`}
                        autoComplete="off"
                        value={optionValue}
                        disabled={disabled}
                        onChange={(e) => {
                            const newValue = e.currentTarget.checked
                                ? [...(value || []), optionValue].filter((v) => v !== null)
                                : (value || []).filter((it) => it !== optionValue) || null;
                            if (onChange !== null) {
                                onChange(newValue);
                            }
                        }}
                        checked={value !== null && value.indexOf(optionValue) !== -1}
                    />
                    {label}
                </label>
            ))}
        </div>
    );
}

export default Checkboxes;
