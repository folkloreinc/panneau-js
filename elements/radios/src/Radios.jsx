/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getSelectOptions } from '@panneau/core/utils';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    options: PanneauPropTypes.selectOptions,
    withBackground: PropTypes.bool,
    disabled: PropTypes.bool,
    uncheckable: PropTypes.bool,
    className: PropTypes.string,
    buttonClassName: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    value: null,
    options: [],
    withBackground: false,
    disabled: false,
    uncheckable: false,
    className: null,
    buttonClassName: null,
    onChange: null,
};

const Radios = ({
    name,
    value,
    options,
    withBackground,
    disabled,
    uncheckable,
    className,
    buttonClassName,
    onChange,
}) => {
    const finalOptions = useMemo(() => getSelectOptions(options), [options]);

    return (
        <div
            className={classNames([
                'd-block',
                'btn-group',
                'btn-group-toggle',
                {
                    [className]: className !== null,
                },
            ])}
            data-toggle="buttons"
            style={{ zIndex: 0 }}
        >
            {finalOptions.map(({ value: optionValue = null, label = null }, index) => {
                // eslint-disable-next-line eqeqeq
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
                                [buttonClassName]: buttonClassName !== null,
                            },
                        ])}
                    >
                        <input
                            type="radio"
                            name={name}
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
};

Radios.propTypes = propTypes;
Radios.defaultProps = defaultProps;

export default Radios;
