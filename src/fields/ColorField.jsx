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
import FormGroup from '../FormGroup';

import styles from '../styles/fields/color.scss';

import Text from './TextField';
import Popover from '../modals/Popover';

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
    colorPosition: 'left',
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
        this.onInputChange = this.onInputChange.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onClickClear = this.onClickClear.bind(this);
        this.onClose = this.onClose.bind(this);
        this.formatColor = this.formatColor.bind(this);

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

    onClickClear() {
        this.props.onChange(null);
    }

    onClick() {
        this.setState({
            displayColorPicker: !this.state.displayColorPicker,
        });
    }

    onClose() {
        this.setState({
            displayColorPicker: false,
        });
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
        } = this.props;
        const Picker = components[pickerType];
        const color = ColorField.parse(value);

        const popoverStyle = {};
        if (colorPosition === 'left') {
            popoverStyle.left = '0%';
        } else if (colorPosition === 'right') {
            popoverStyle.right = '0%';
        }

        return (
            <Popover
                className={styles.popover}
                style={popoverStyle}
                onClose={this.onClose}
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

        const { displayColorPicker } = this.state;

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
            <div className={buttonGroupClassName}>
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
                <div className={styles.container}>
                    { withInput ? (
                        <div className="input-group">
                            <Text
                                {...other}
                                inputOnly
                                value={value}
                                onChange={this.onInputChange}
                            />
                            { buttonGroup }
                        </div>
                    ) : buttonGroup }
                    { displayColorPicker ? this.renderPopover() : null }
                </div>
            </FormGroup>
        );
    }
}

ColorField.propTypes = propTypes;
ColorField.defaultProps = defaultProps;

export default ColorField;
