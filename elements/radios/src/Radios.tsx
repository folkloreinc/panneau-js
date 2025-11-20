/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import { useMemo } from 'react';

import { getSelectOptions } from '@panneau/core/utils';

interface SelectOption {
    value?: string | number | null;
    label?: React.ReactNode;
}

interface RadiosProps {
    name?: string | null;
    value?: string | null;
    options?: SelectOption[] | Record<string, string>[];
    withBackground?: boolean;
    disabled?: boolean;
    uncheckable?: boolean;
    className?: string | null;
    buttonClassName?: string | null;
    onChange?: ((value: string | number | null) => void) | null;
}

const DEFAULT_OPTIONS: SelectOption[] = [];

function Radios({
    name = null,
    value = null,
    options = DEFAULT_OPTIONS,
    withBackground = false,
    disabled = false,
    uncheckable = false,
    className = null,
    buttonClassName = null,
    onChange = null,
}: RadiosProps) {
    const finalOptions = useMemo(() => getSelectOptions(options as any), [options]);

    return (
        <div
            className={classNames([
                'd-block',
                'btn-group',
                'btn-group-toggle',
                {
                    [className!]: className !== null,
                },
            ])}
            data-toggle="buttons"
            style={{ zIndex: 0 }}
        >
            {finalOptions.map(({ value: optionValue = null, label = null }: any, index: number) => {
                const isCurrent = optionValue == value; // Loose to handle numeric values from parseQuery
                return (
                    <label
                        key={`radio-${optionValue}-${index + 1}`}
                        className={classNames([
                            'btn',
                            withBackground ? 'btn-secondary' : 'btn-outline-secondary',
                            {
                                active: isCurrent,
                                disabled,
                                [buttonClassName!]: buttonClassName !== null,
                            },
                        ])}
                    >
                        <input
                            type="radio"
                            name={name || undefined}
                            className="btn-check"
                            autoComplete="off"
                            disabled={disabled}
                            value={optionValue || ''}
                            onClick={(e) => {
                                if (onChange !== null) {
                                    if (uncheckable && isCurrent) {
                                        onChange(null);
                                    } else {
                                        onChange(e.currentTarget.checked ? optionValue : null);
                                    }
                                }
                            }}
                            onChange={() => {}}
                            checked={isCurrent}
                        />
                        {label}
                    </label>
                );
            })}
        </div>
    );
}

export default Radios;
