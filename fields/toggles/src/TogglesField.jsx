/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import ToggleField from '@panneau/field-toggle';

import styles from './styles.module.scss';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.objectOf(PropTypes.bool),
    toggles: PanneauPropTypes.toggles,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    value: null,
    toggles: [],
    className: null,
    onChange: null,
};

const TogglesField = ({ name, value, toggles, onChange, className }) => {
    const onToggleChange = useCallback(
        (key, newToggleValue) => {
            const newValue = {
                ...value,
                [key]: newToggleValue,
            };
            if (onChange !== null) {
                onChange(newValue);
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
                            />
                            {toggleLabel ? (
                                <span className="ms-2">{toggleLabel}</span>
                            ) : null}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};
TogglesField.propTypes = propTypes;
TogglesField.defaultProps = defaultProps;

export default TogglesField;
