/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getSelectOptions } from '@panneau/core/utils';

import styles from './styles.module.scss';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.string),
    options: PanneauPropTypes.selectOptions,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    value: null,
    options: [],
    disabled: false,
    className: null,
    onChange: null,
};

const Checkboxes = ({ name, value, options, disabled, className, onChange }) => {
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
                                ? [...value, optionValue].filter((v) => v !== null)
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
};

Checkboxes.propTypes = propTypes;
Checkboxes.defaultProps = defaultProps;

export default Checkboxes;
