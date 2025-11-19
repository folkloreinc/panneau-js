/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import isEmpty from 'lodash-es/isEmpty';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import { FormattedMessage } from 'react-intl';
import tinycolor from 'tinycolor2';

import { useDocumentEvent } from '@panneau/core/hooks';

import styles from './styles.module.css';

interface ColorValue {
    color: string;
    alpha: number;
}

interface ColorPickerFieldProps {
    value?: string | ColorValue | null;
    defaultValue?: string;
    native?: boolean;
    withAlpha?: boolean;
    disabled?: boolean;
    className?: string | null;
    onChange?: ((value: string | ColorValue) => void) | null;
}

function ColorPickerField({
    value = null,
    defaultValue = '#000000',
    native = false,
    withAlpha = false,
    disabled = false,
    className = null,
    onChange = null,
}: ColorPickerFieldProps) {
    const emptyValue = isEmpty(value);

    const [pickerOpened, setPickerOpened] = useState(false);
    const rgbaColor = useMemo(() => {
        if (!emptyValue) {
            const newColor = tinycolor(typeof value === 'object' ? value.color : value);
            newColor.setAlpha(typeof value === 'object' ? value.alpha : 1);
            return newColor;
        }
        return null;
    }, [emptyValue, value]);

    const hexColor = useMemo(
        () => (rgbaColor !== null ? rgbaColor.toHexString() : defaultValue),
        [rgbaColor, defaultValue],
    );
    const alphaValue = useMemo(
        () => (rgbaColor !== null ? rgbaColor.getAlpha() || null : null),
        [rgbaColor],
    );
    const finalColor =
        withAlpha && alphaValue !== null && alphaValue !== 1
            ? `${hexColor} (${alphaValue.toFixed(2)})`
            : hexColor;

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
        (e: React.ChangeEvent<HTMLInputElement>) => {
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
        (e: React.MouseEvent) => {
            if (!native) {
                e.preventDefault();
                setPickerOpened(!pickerOpened);
            }
        },
        [native, setPickerOpened, pickerOpened],
    );

    const onPickerChange = useCallback(
        (newValue: { hex: string; rgb: { a?: number } }) => {
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

    const pickerRef = useRef<HTMLDivElement>(null);
    const onDocumentClick = useCallback(
        (e: MouseEvent) => {
            if (
                pickerRef.current !== null &&
                !pickerRef.current.contains(e.target as Node)
            ) {
                setPickerOpened(false);
            }
        },
        [setPickerOpened],
    );
    useDocumentEvent('click', onDocumentClick, !native && pickerOpened);

    const finalLabel = emptyValue ? (
        <span className={styles.emptyLabel}>
            <FormattedMessage defaultMessage="No color" description="Empty label" />
        </span>
    ) : (
        finalColor
    );
    const finalHexColor = emptyValue ? defaultValue : hexColor;

    return (
        <div
            className={classNames([
                styles.container,
                'position-relative',
                {
                    [styles.disabled]: disabled,
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
                    value={finalHexColor}
                    disabled={disabled}
                    onChange={onInputChange}
                    onClick={onInputClick}
                />
                {!native ? (
                    <button
                        type="button"
                        className={classNames([
                            styles.button,
                            'flex-grow-1',
                            'text-uppercase',
                            'input-group-text',
                        ])}
                        disabled={disabled}
                        style={{ minWidth: 100, cursor: 'pointer' }}
                        onClick={onInputClick}
                    >
                        {finalLabel}
                    </button>
                ) : (
                    <span
                        className={classNames([
                            'flex-grow-1',
                            'text-uppercase',
                            'input-group-text',
                        ])}
                        style={{ minWidth: 100, cursor: 'pointer' }}
                    >
                        {finalLabel}
                    </span>
                )}
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
                        disabled={disabled}
                    />
                </div>
            ) : null}
        </div>
    );
}

export default ColorPickerField;
