/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SketchPicker } from 'react-color';
import tinycolor from 'tinycolor2';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
        color: PropTypes.string,
        alpha: PropTypes.number,
    })]),
    defaultValue: PropTypes.string,
    native: PropTypes.bool,
    withAlpha: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    defaultValue: '#000000',
    native: false,
    withAlpha: false,
    className: null,
    onChange: null,
};

const ColorPickerField = ({ className, value, defaultValue, native, withAlpha, onChange }) => {
    const [pickerOpened, setPickerOpened] = useState(false);
    const rgbaColor = useMemo(() => {
        if (value !== null) {
            const newColor = tinycolor(typeof value === 'object' ? value.color : value);
            newColor.setAlpha(typeof value === 'object' ? value.alpha : 1);
            return newColor;
        }
        return null;
    }, [value]);
    

    const hexColor = useMemo( () => rgbaColor !== null ? rgbaColor.toHexString() : defaultValue, [rgbaColor, defaultValue]);

    const pickerStyle = useMemo(
        () => ({
            picker: {
                boxShadow: 'none',
                backgroundColor: '#FFF',
                borderRadius: '4px',
            },
            label: {
                color: '#FFF',
            },
        }),
        [],
    );

    const onInputChange = useCallback(
        (e) => {
            if (onChange !== null) {
                onChange({
                    color: e.target.value,
                    alpha: 1,
                });
            }
        },
        [onChange],
    );

    const onInputClick = useCallback(
        (e) => {
            if (!native) {
                e.preventDefault();
                setPickerOpened((prevPickerOpened) => !prevPickerOpened);
            }
        },
        [native, setPickerOpened],
    );

    const onPickerChange = useCallback(
        (newValue) => {
            if (onChange !== null) {
                const { hex, rgb: { a: alpha = 1 }} = newValue || {};

                onChange(withAlpha ? {
                    color: hex,
                    alpha,
                } : hex );
            }
        },
        [onChange, withAlpha],
    );

    useEffect(() => {
        const onWindowClick = () => {
            if (!native && pickerOpened) {
                setPickerOpened(false);
            }
        };
        window.addEventListener('click', onWindowClick);
        return () => {
            window.removeEventListener('click', onWindowClick);
        };
    }, [native, pickerOpened, setPickerOpened]);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.pickerOpened]: pickerOpened,
                },
            ])}
        >
            <label className="input-group">
                <input
                    type="color"
                    className={classNames([
                        styles.colorInput,
                        'form-control',
                        'form-control-color',
                    ])}
                    value={hexColor}
                    onChange={onInputChange}
                    onClick={onInputClick}
                />
                <span className={classNames([styles.hexLabel, 'input-group-text'])}>
                    {hexColor}
                </span>
            </label>
            {!native ? (
                <SketchPicker
                    disableAlpha={!withAlpha}
                    className={styles.picker}
                    color={rgbaColor || defaultValue}
                    styles={pickerStyle}
                    onChange={onPickerChange}
                />
            ) : null}
        </div>
    );
};

ColorPickerField.propTypes = propTypes;
ColorPickerField.defaultProps = defaultProps;

export default ColorPickerField;
