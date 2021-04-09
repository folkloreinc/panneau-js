/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import styles from './styles.module.scss';

const propTypes = {
    name: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    errors: PanneauPropTypes.formErrors,
    feedback: PanneauPropTypes.feedback,
    placeholder: PanneauPropTypes.text,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readonly: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    type: 'text',
    value: null,
    errors: null,
    placeholder: null,
    required: false,
    disabled: false,
    readonly: false,
    feedback: null,
    className: null,
    onChange: null,
};

const TestField = ({
    type,
    name,
    value,
    errors,
    placeholder,
    required,
    disabled,
    readonly,
    feedback,
    onChange,
    className,
}) => {
    const onInputChange = useCallback(
        (e) => {
            if (onChange !== null) {
                onChange(
                    type === 'number' ? parseInt(e.currentTarget.value, 10) : e.currentTarget.value,
                );
            }
        },
        [type, onChange],
    );
    return (
        <input
            type={type}
            name={name}
            value={value || ''}
            placeholder={placeholder}
            onChange={onInputChange}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            className={classNames([
                styles.container,
                'form-control',
                {
                    [styles.hasErrors]: errors !== null && errors.length > 0,
                    [styles[feedback]]: feedback !== null,
                    [className]: className !== null,
                },
            ])}
        />
    );
};

TestField.propTypes = propTypes;
TestField.defaultProps = defaultProps;

export default TestField;
