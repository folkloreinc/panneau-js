/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SketchPicker } from 'react-color';
import tinycolor from 'tinycolor2';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.shape({
        color: PropTypes.string,
        alpha: PropTypes.number,
    }),
    native: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    native: false,
    className: null,
    onChange: null,
};

const ColorPickerField = ({ className, value, native, onChange }) => {
    const [pickerOpened, setPickerOpened] = useState(false);
    const rgbaColor = useMemo(() => {
        if (value !== null) {
            const newColor = tinycolor(value.color);
            newColor.setAlpha(value.alpha);
            return newColor;
        }
        return '';
    }, [value]);

    const { color: hexColor = '#000000' } = value || {};

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
                onChange({
                    color: newValue.hex,
                    alpha: newValue.rgb.a,
                });
            }
        },
        [onChange],
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
                    className={styles.picker}
                    color={rgbaColor}
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
