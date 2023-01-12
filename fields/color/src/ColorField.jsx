import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import tinycolor from 'tinycolor2';

import { useDocumentEvent } from '@panneau/core/hooks';

const propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            color: PropTypes.string,
            alpha: PropTypes.number,
        }),
    ]),
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

    const hexColor = useMemo(
        () => (rgbaColor !== null ? rgbaColor.toHexString() : defaultValue),
        [rgbaColor, defaultValue],
    );

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
                setPickerOpened(!pickerOpened);
            }
        },
        [native, setPickerOpened, pickerOpened],
    );

    const onPickerChange = useCallback(
        (newValue) => {
            if (onChange !== null) {
                const {
                    hex,
                    rgb: { a: alpha = 1 },
                } = newValue || {};

                onChange(
                    withAlpha
                        ? {
                              color: hex,
                              alpha,
                          }
                        : hex,
                );
            }
        },
        [onChange, withAlpha],
    );

    const pickerRef = useRef(null);
    const onDocumentClick = useCallback(
        (e) => {
            if (pickerRef.current !== null && !pickerRef.current.contains(e.target)) {
                setPickerOpened(false);
            }
        },
        [setPickerOpened],
    );
    useDocumentEvent('click', onDocumentClick, !native && pickerOpened);

    return (
        <div
            className={classNames([
                'position-relative',
                {
                    [className]: className !== null,
                },
            ])}
            ref={pickerRef}
        >
            <label className="input-group">
                <input
                    type="color"
                    className={classNames(['flex-grow-0', 'form-control', 'form-control-color'])}
                    style={{ width: 40 }}
                    value={hexColor}
                    onChange={onInputChange}
                    onClick={onInputClick}
                />
                <span
                    className={classNames(['flex-grow-1', 'text-uppercase', 'input-group-text'])}
                    style={{ minWidth: 100, cursor: 'pointer' }}
                    onClick={onInputClick}
                >
                    {hexColor}
                </span>
            </label>
            {!native ? (
                <div
                    className={classNames([
                        'position-absolute',
                        'mt-1',
                        'p-2',
                        'border',
                        'bg-white',
                        {
                            invisible: !pickerOpened,
                        },
                    ])}
                    style={{ zIndex: 4, width: 300 }}
                >
                    <SketchPicker
                        disableAlpha={!withAlpha}
                        color={rgbaColor || defaultValue}
                        styles={pickerStyle}
                        onChange={onPickerChange}
                    />
                </div>
            ) : null}
        </div>
    );
};

ColorPickerField.propTypes = propTypes;
ColorPickerField.defaultProps = defaultProps;

export default ColorPickerField;
