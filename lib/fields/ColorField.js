import _extends from 'babel-runtime/helpers/extends';
import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _createClass from 'babel-runtime/helpers/createClass';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BlockPicker, ChromePicker, CirclePicker, CompactPicker, GithubPicker, TwitterPicker, SketchPicker, SliderPicker, SwatchesPicker } from 'react-color';
import Color from 'color';
import isString from 'lodash/isString';
import classNames from 'classnames';
import FormGroup from '../FormGroup';

var styles = {
    'formGroup': 'panneau_color_formGroup',
    'swatch': 'panneau_color_swatch',
    'popover': 'panneau_color_popover',
    'cover': 'panneau_color_cover',
    'container': 'panneau_color_container'
};

/**
 *  Class: ColorField
 *
 *  @param {string,number} value
 *  @return {color} val
 */

var components = {
    block: BlockPicker,
    chrome: ChromePicker,
    circle: CirclePicker,
    compact: CompactPicker,
    github: GithubPicker,
    twitter: TwitterPicker,
    sketch: SketchPicker,
    slider: SliderPicker,
    swatches: SwatchesPicker
};

var propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    pickerType: PropTypes.oneOf(['block', 'chrome', 'circle', 'compact', 'github', 'twitter', 'sketch', 'slider', 'swatches']),
    outputFormat: PropTypes.oneOf(['hex', 'rgb', 'rgba', 'auto']),
    value: PropTypes.string,

    colors: PropTypes.array,
    presetColors: PropTypes.array,
    onChange: PropTypes.func,

    displayColorPicker: PropTypes.bool,
    colorPosition: PropTypes.string,
    popoverStyle: PropTypes.object,
    inline: PropTypes.bool,
    disabled: PropTypes.bool,
    inputOnly: PropTypes.bool
};

var defaultProps = {
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
    inputOnly: false
};

var ColorField = function (_Component) {
    _inherits(ColorField, _Component);

    _createClass(ColorField, null, [{
        key: 'parse',
        value: function parse(value) {
            var color = {
                r: 0,
                g: 0,
                b: 0,
                a: 1
            };
            if (isString(value)) {
                try {
                    var colorParsed = Color(value);
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
    }]);

    function ColorField(props) {
        _classCallCheck(this, ColorField);

        var _this = _possibleConstructorReturn(this, (ColorField.__proto__ || Object.getPrototypeOf(ColorField)).call(this, props));

        _this.onChange = _this.onChange.bind(_this);
        _this.onClick = _this.onClick.bind(_this);
        _this.onClickClear = _this.onClickClear.bind(_this);
        _this.onClose = _this.onClose.bind(_this);
        _this.formatColor = _this.formatColor.bind(_this);

        _this.state = {
            displayColorPicker: props.displayColorPicker
        };
        return _this;
    }

    _createClass(ColorField, [{
        key: 'onChange',
        value: function onChange(value) {
            var newValue = this.formatColor(value);
            if (this.props.onChange && isString(newValue) && newValue !== this.props.value) {
                this.props.onChange(newValue);
            }
        }
    }, {
        key: 'onClickClear',
        value: function onClickClear() {
            this.props.onChange(null);
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            this.setState({
                displayColorPicker: !this.state.displayColorPicker
            });
        }
    }, {
        key: 'onClose',
        value: function onClose() {
            this.setState({
                displayColorPicker: false
            });
        }
    }, {
        key: 'formatColor',
        value: function formatColor(color) {
            var outputFormat = this.props.outputFormat;


            var output = '';
            switch (outputFormat) {
                case 'rgb':
                    output = 'rgb(' + color.rgb.r + ', ' + color.rgb.g + ', ' + color.rgb.b + ')';
                    break;
                case 'rgba':
                    output = 'rgba(' + color.rgb.r + ', ' + color.rgb.g + ', ' + color.rgb.b + ', ' + color.rgb.a + ')';
                    break;
                case 'hex':
                    output = color.hex;
                    break;
                default:
                    // Aka auto
                    if (color.rgb.a < 1) {
                        output = 'rgba(' + color.rgb.r + ', ' + color.rgb.g + ', ' + color.rgb.b + ', ' + color.rgb.a + ')';
                    } else {
                        output = color.hex;
                    }
            }
            return output;
        }
    }, {
        key: 'renderPopover',
        value: function renderPopover() {
            var _props = this.props,
                pickerType = _props.pickerType,
                value = _props.value,
                colors = _props.colors,
                inline = _props.inline,
                presetColors = _props.presetColors,
                colorPosition = _props.colorPosition;

            var Picker = components[pickerType];
            var color = ColorField.parse(value);

            var popoverStyle = {
                left: inline ? '-230px' : '62px'
            };
            if (colorPosition === 'left') {
                popoverStyle.left = '-230px';
            } else if (colorPosition === 'right') {
                popoverStyle.left = '62px';
            }

            return React.createElement(
                'div',
                { className: styles.popover, style: popoverStyle },
                React.createElement('button', { type: 'button', className: styles.cover, onClick: this.onClose }),
                React.createElement(Picker, {
                    onChangeComplete: this.onChange,
                    color: color,
                    colors: colors,
                    presetColors: presetColors
                })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _classNames;

            var _props2 = this.props,
                pickerType = _props2.pickerType,
                name = _props2.name,
                value = _props2.value,
                label = _props2.label,
                colors = _props2.colors,
                disabled = _props2.disabled,
                presetColors = _props2.presetColors,
                colorPosition = _props2.colorPosition,
                other = _objectWithoutProperties(_props2, ['pickerType', 'name', 'value', 'label', 'colors', 'disabled', 'presetColors', 'colorPosition']);

            var displayColorPicker = this.state.displayColorPicker;


            var color = ColorField.parse(value);

            var colorStyle = {
                background: value !== null ? 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + color.a + ')' : null
            };

            var formGroupClassName = classNames((_classNames = {}, _defineProperty(_classNames, styles.formGroup, true), _defineProperty(_classNames, 'form-group-color', true), _classNames));

            return React.createElement(
                FormGroup,
                _extends({
                    name: name,
                    label: label,
                    className: formGroupClassName
                }, other),
                React.createElement(
                    'div',
                    { className: styles.container },
                    React.createElement(
                        'div',
                        { className: 'btn-group' },
                        React.createElement(
                            'button',
                            {
                                type: 'button',
                                className: classNames({
                                    btn: true,
                                    'btn-default': true,
                                    disabled: disabled
                                }),
                                disabled: disabled,
                                onClick: this.onClick
                            },
                            React.createElement('span', { className: styles.swatch, style: colorStyle })
                        ),
                        React.createElement(
                            'button',
                            {
                                type: 'button',
                                className: classNames({
                                    btn: true,
                                    'btn-default': true,
                                    'btn-clear': true,
                                    disabled: disabled
                                }),
                                disabled: value === null || disabled,
                                onClick: this.onClickClear
                            },
                            React.createElement('span', { className: 'fa fa-remove' })
                        )
                    ),
                    displayColorPicker ? this.renderPopover() : null
                )
            );
        }
    }]);

    return ColorField;
}(Component);

ColorField.propTypes = propTypes;
ColorField.defaultProps = defaultProps;

export default ColorField;