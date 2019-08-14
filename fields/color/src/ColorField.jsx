/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    BlockPicker,
    ChromePicker,
    CirclePicker,
    CompactPicker,
    GithubPicker,
    TwitterPicker,
    SketchPicker,
    SliderPicker,
    SwatchesPicker,
} from 'react-color';
import Color from 'color';
import isString from 'lodash/isString';
import classNames from 'classnames';
import { FormGroup } from '@panneau/field';
import Text from '@panneau/field-text';
import Popover from '@panneau/modal-popover';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { Button } from '@panneau/core/components';

import styles from './styles.scss';

/**
 *  Class: ColorField
 *
 *  @param {string,number} value
 *  @return {color} val
 */

const components = {
    block: BlockPicker,
    chrome: ChromePicker,
    circle: CirclePicker,
    compact: CompactPicker,
    github: GithubPicker,
    twitter: TwitterPicker,
    sketch: SketchPicker,
    slider: SliderPicker,
    swatches: SwatchesPicker,
};

const parseColor = value => {
    const color = {
        r: 0,
        g: 0,
        b: 0,
        a: 1,
    };
    if (isString(value)) {
        try {
            const colorParsed = Color(value);
            color.r = colorParsed.red();
            color.g = colorParsed.green();
            color.b = colorParsed.blue();
            color.a = colorParsed.alpha();
        } catch (e) {
            // console.log(`Unparseable color format: ${value}`);
            return color;
        }
    }

    return color;
};

const formatColor = (color, format) => {
    let output = '';
    switch (format) {
        case 'rgb':
            output = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
            break;
        case 'rgba':
            output = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
            break;
        case 'hex':
            output = color.hex;
            break;
        default:
            // Aka auto
            if (color.rgb.a < 1) {
                output = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
            } else {
                output = color.hex;
            }
    }
    return output;
};

const propTypes = {
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    pickerType: PropTypes.oneOf(Object.keys(components)),
    outputFormat: PropTypes.oneOf(['hex', 'rgb', 'rgba', 'auto']),
    value: PropTypes.string,

    colors: PropTypes.arrayOf(PropTypes.string),
    presetColors: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,

    displayColorPicker: PropTypes.bool,
    colorPosition: PropTypes.string,
    popoverStyle: PropTypes.object, // eslint-disable-line
    disabled: PropTypes.bool,
    withInput: PropTypes.bool,
};

const defaultProps = {
    name: null,
    label: '',
    pickerType: 'sketch',
    outputFormat: 'auto', // When auto picks the simplest format for you

    value: null,
    colors: [],
    presetColors: [],
    onChange: null,

    displayColorPicker: false,
    colorPosition: 'auto',
    popoverStyle: null,
    disabled: false,
    withInput: false,
};

const ColorField = ({
    name,
    label,
    pickerType,
    value,
    colors,
    presetColors,
    colorPosition,
    withInput,
    disabled,
    onChange,
    displayColorPicker: initialDisplayColorPicker,
    ...other
}) => {
    const [displayColorPicker, setDisplayColorPicker] = useState(initialDisplayColorPicker);
    const refButton = useRef(null);
    const refContainer = useRef(null);
    const onClose = useCallback(() => setDisplayColorPicker(false), []);
    const onInputFocus = useCallback(() => setDisplayColorPicker(true), []);
    const onClick = useCallback(() => setDisplayColorPicker(!displayColorPicker), [
        displayColorPicker,
    ]);
    const onClickClear = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }
    }, [onChange]);
    const onInputChange = useCallback(
        newValue => {
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange],
    );
    const onPickerChange = useCallback(
        newValue => {
            const newFormattedValue = formatColor(newValue);
            if (onChange !== null && isString(newFormattedValue) && newFormattedValue !== value) {
                onChange(newFormattedValue);
            }
        },
        [value, onChange],
    );

    const color = parseColor(value);

    const buttonGroup = (
        <div
            className={classNames({
                'btn-group': !withInput,
                'input-group-append': withInput,
            })}
            ref={refButton}
        >
            <Button
                style="outline-light"
                disabled={disabled}
                className={styles.colorBtn}
                onClick={onClick}
            >
                <span
                    className={styles.swatch}
                    style={{
                        background:
                            value !== null
                                ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
                                : null,
                    }}
                />
            </Button>
            <Button
                style="outline-secondary"
                disabled={value === null || disabled}
                className={styles.clearBtn}
                onClick={onClickClear}
            >
                <span className="fas fa-times" />
            </Button>
        </div>
    );

    const Picker = components[pickerType];

    return (
        <FormGroup
            name={name}
            label={label}
            className={classNames([styles.formGroup, 'form-group-color'])}
            {...other}
        >
            <div className={styles.container} ref={refContainer}>
                {withInput ? (
                    <div className="input-group">
                        <Text
                            {...other}
                            inputOnly
                            value={value}
                            onFocus={onInputFocus}
                            onChange={onInputChange}
                        />
                        {buttonGroup}
                    </div>
                ) : (
                    buttonGroup
                )}
                <Popover
                    className={styles.popover}
                    onClose={onClose}
                    visible={displayColorPicker}
                    element={withInput ? refContainer.current : refButton.current}
                    elementPlacement={colorPosition}
                    offsetX="2px"
                    blurElement={withInput ? refContainer.current : null}
                    closeOnBlur
                    noUi
                >
                    <Picker
                        onChangeComplete={onPickerChange}
                        color={color}
                        colors={colors}
                        presetColors={presetColors}
                    />
                </Popover>
            </div>
        </FormGroup>
    );
};

ColorField.propTypes = propTypes;
ColorField.defaultProps = defaultProps;

export default ColorField;
