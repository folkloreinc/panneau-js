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

    colors: PropTypes.array,
    presetColors: PropTypes.array,
    onChange: PropTypes.func,

    displayColorPicker: PropTypes.bool,
    colorPosition: PropTypes.string,
    popoverStyle: PropTypes.object,
    inline: PropTypes.bool,
    disabled: PropTypes.bool,
    inputOnly: PropTypes.bool,
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
    colorPosition: 'right',
    popoverStyle: null,
    inline: true,
    disabled: false,
    inputOnly: false,
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
            inline,
            presetColors,
            colorPosition,
        } = this.props;
        const Picker = components[pickerType];
        const color = ColorField.parse(value);

        const popoverStyle = {
            left: inline ? '-230px' : '62px',
        };
        if (colorPosition === 'left') {
            popoverStyle.left = '-230px';
        } else if (colorPosition === 'right') {
            popoverStyle.left = '62px';
        }

        return (
            <div className={styles.popover} style={popoverStyle}>
                <button type="button" className={styles.cover} onClick={this.onClose} />
                <Picker
                    onChangeComplete={this.onChange}
                    color={color}
                    colors={colors}
                    presetColors={presetColors}
                />
            </div>
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

        return (
            <FormGroup
                name={name}
                label={label}
                className={formGroupClassName}
                {...other}
            >
                <div className={styles.container}>
                    <div className="btn-group">
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
                    { displayColorPicker ? this.renderPopover() : null }
                </div>
            </FormGroup>
        );
    }
}

ColorField.propTypes = propTypes;
ColorField.defaultProps = defaultProps;

export default ColorField;
