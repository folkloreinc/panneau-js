import React, { Component } from 'react';
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

const propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    pickerType: PropTypes.oneOf([
        'block', 'chrome', 'circle', 'compact',
        'github', 'twitter', 'sketch', 'slider',
        'swatches',
    ]),
    outputFormat: PropTypes.oneOf([
        'hex', 'rgb', 'rgba', 'auto',
    ]),
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

class ColorField extends Component {
    static parse(value) {
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
    }

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onInputFocus = this.onInputFocus.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onClickClear = this.onClickClear.bind(this);
        this.onClose = this.onClose.bind(this);
        this.formatColor = this.formatColor.bind(this);

        this.refContainer = null;
        this.refButton = null;

        this.state = {
            displayColorPicker: props.displayColorPicker,
        };
    }

    onChange(value) {
        const newValue = this.formatColor(value);
        if (this.props.onChange && isString(newValue) && newValue !== this.props.value) {
            this.props.onChange(newValue);
        }
    }

    onInputChange(value) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    onInputFocus() {
        this.setState(() => ({
            displayColorPicker: true,
        }));
    }

    onClickClear() {
        this.props.onChange(null);
    }

    onClick() {
        this.setState(() => ({
            displayColorPicker: !this.state.displayColorPicker,
        }));
    }

    onClose() {
        this.setState(() => ({
            displayColorPicker: false,
        }));
    }

    formatColor(color) {
        const { outputFormat } = this.props;

        let output = '';
        switch (outputFormat) {
        case 'rgb':
            output = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
            break;
        case 'rgba':
            output = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
            break;
        case 'hex':
            output = color.hex;
            break;
        default: // Aka auto
            if (color.rgb.a < 1) {
                output = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
            } else {
                output = color.hex;
            }
        }
        return output;
    }

    renderPopover() {
        const {
            pickerType,
            value,
            colors,
            presetColors,
            colorPosition,
            withInput,
        } = this.props;
        const { displayColorPicker } = this.state;
        const Picker = components[pickerType];
        const color = ColorField.parse(value);

        return (
            <Popover
                className={styles.popover}
                onClose={this.onClose}
                visible={displayColorPicker}
                element={withInput ? this.refContainer : this.refButton}
                elementPlacement={colorPosition}
                offsetX="2px"
                blurElement={withInput ? this.refContainer : null}
                closeOnBlur
                noUi
            >
                <Picker
                    onChangeComplete={this.onChange}
                    color={color}
                    colors={colors}
                    presetColors={presetColors}
                />
            </Popover>
        );
    }

    render() {
        const {
            pickerType,
            name,
            value,
            label,
            colors,
            disabled,
            presetColors,
            colorPosition,
            withInput,
            ...other
        } = this.props;

        const color = ColorField.parse(value);

        const colorStyle = {
            background: value !== null ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` : null,
        };

        const formGroupClassName = classNames({
            [styles.formGroup]: true,
            'form-group-color': true,
        });

        const buttonGroupClassName = classNames({
            'btn-group': !withInput,
            'input-group-btn': withInput,
        });

        const buttonGroup = (
            <div
                className={buttonGroupClassName}
                ref={(ref) => { this.refButton = ref; }}
            >
                <button
                    type="button"
                    className={classNames({
                        btn: true,
                        'btn-default': true,
                        disabled,
                    })}
                    disabled={disabled}
                    onClick={this.onClick}
                >
                    <span className={styles.swatch} style={colorStyle} />
                </button>
                <button
                    type="button"
                    className={classNames({
                        btn: true,
                        'btn-default': true,
                        'btn-clear': true,
                        disabled,
                    })}
                    disabled={value === null || disabled}
                    onClick={this.onClickClear}
                >
                    <span className="fa fa-remove" />
                </button>
            </div>
        );

        return (
            <FormGroup
                name={name}
                label={label}
                className={formGroupClassName}
                {...other}
            >
                <div
                    className={styles.container}
                    ref={(ref) => { this.refContainer = ref; }}
                >
                    { withInput ? (
                        <div className="input-group">
                            <Text
                                {...other}
                                inputOnly
                                value={value}
                                onFocus={this.onInputFocus}
                                onChange={this.onInputChange}
                            />
                            { buttonGroup }
                        </div>
                    ) : buttonGroup }
                    { this.renderPopover() }
                </div>
            </FormGroup>
        );
    }
}

ColorField.propTypes = propTypes;
ColorField.defaultProps = defaultProps;

export default ColorField;
