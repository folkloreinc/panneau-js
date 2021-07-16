/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getSelectOptions } from '@panneau/core/utils';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    options: PanneauPropTypes.selectOptions,
    withBackground: PropTypes.bool,
    className: PropTypes.string,
    buttonClassName: PropTypes.string,
    onChange: PropTypes.func,
    uncheckable: PropTypes.bool,
};

const defaultProps = {
    name: null,
    value: null,
    options: [],
    withBackground: false,
    className: null,
    buttonClassName: null,
    onChange: null,
    uncheckable: false,
};

const Radios = ({
    name,
    value,
    options,
    withBackground,
    className,
    buttonClassName,
    onChange,
    uncheckable,
}) => {
    const finalOptions = useMemo(() => getSelectOptions(options), [options]);

    return (
        <div
            className={classNames([
                'btn-group',
                'btn-group-toggle',
                {
                    [className]: className !== null,
                },
            ])}
            data-toggle="buttons"
        >
            {finalOptions.map(({ value: optionValue, label }, index) => (
                <label
                    key={`radio-${optionValue}-${index + 1}`}
                    className={classNames([
                        'btn',
                        withBackground ? 'btn-secondary' : 'btn-outline-secondary',
                        {
                            active: optionValue === value,
                            [buttonClassName]: buttonClassName !== null,
                        },
                    ])}
                >
                    <input
                        type="radio"
                        name={name}
                        className="btn-check"
                        autoComplete="off"
                        value={optionValue || ''}
                        onClick={(e) => {
                            if (onChange !== null) {
                                if (uncheckable && optionValue === value) {
                                    onChange(null);
                                } else {
                                    onChange(e.currentTarget.checked ? optionValue : null);
                                }
                            }
                        }}
                        onChange={() => {}}
                        checked={optionValue === value}
                    />
                    {label}
                </label>
            ))}
        </div>
    );
};

Radios.propTypes = propTypes;
Radios.defaultProps = defaultProps;

export default Radios;
