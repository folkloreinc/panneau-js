'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactColor = require('react-color');

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _FormGroup = require('../FormGroup');

var _FormGroup2 = _interopRequireDefault(_FormGroup);

var _TextField = require('./TextField');

var _TextField2 = _interopRequireDefault(_TextField);

var _Popover = require('../modals/Popover');

var _Popover2 = _interopRequireDefault(_Popover);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
    'formGroup': 'panneau-color-formGroup',
    'swatch': 'panneau-color-swatch',
    'popover': 'panneau-color-popover',
    'container': 'panneau-color-container'
};


/**
 *  Class: ColorField
 *
 *  @param {string,number} value
 *  @return {color} val
 */

var components = {
    block: _reactColor.BlockPicker,
    chrome: _reactColor.ChromePicker,
    circle: _reactColor.CirclePicker,
    compact: _reactColor.CompactPicker,
    github: _reactColor.GithubPicker,
    twitter: _reactColor.TwitterPicker,
    sketch: _reactColor.SketchPicker,
    slider: _reactColor.SliderPicker,
    swatches: _reactColor.SwatchesPicker
};

var propTypes = {
    name: _propTypes2.default.string,
    label: _propTypes2.default.string,
    pickerType: _propTypes2.default.oneOf(['block', 'chrome', 'circle', 'compact', 'github', 'twitter', 'sketch', 'slider', 'swatches']),
    outputFormat: _propTypes2.default.oneOf(['hex', 'rgb', 'rgba', 'auto']),
    value: _propTypes2.default.string,

    colors: _propTypes2.default.arrayOf(_propTypes2.default.string),
    presetColors: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onChange: _propTypes2.default.func,

    displayColorPicker: _propTypes2.default.bool,
    colorPosition: _propTypes2.default.string,
    popoverStyle: _propTypes2.default.object, // eslint-disable-line
    disabled: _propTypes2.default.bool,
    withInput: _propTypes2.default.bool
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
    colorPosition: 'left',
    popoverStyle: null,
    disabled: false,
    withInput: false
};

var ColorField = function (_Component) {
    (0, _inherits3.default)(ColorField, _Component);
    (0, _createClass3.default)(ColorField, null, [{
        key: 'parse',
        value: function parse(value) {
            var color = {
                r: 0,
                g: 0,
                b: 0,
                a: 1
            };
            if ((0, _isString2.default)(value)) {
                try {
                    var colorParsed = (0, _color2.default)(value);
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
        (0, _classCallCheck3.default)(this, ColorField);

        var _this = (0, _possibleConstructorReturn3.default)(this, (ColorField.__proto__ || Object.getPrototypeOf(ColorField)).call(this, props));

        _this.onChange = _this.onChange.bind(_this);
        _this.onInputChange = _this.onInputChange.bind(_this);
        _this.onClick = _this.onClick.bind(_this);
        _this.onClickClear = _this.onClickClear.bind(_this);
        _this.onClose = _this.onClose.bind(_this);
        _this.formatColor = _this.formatColor.bind(_this);

        _this.state = {
            displayColorPicker: props.displayColorPicker
        };
        return _this;
    }

    (0, _createClass3.default)(ColorField, [{
        key: 'onChange',
        value: function onChange(value) {
            var newValue = this.formatColor(value);
            if (this.props.onChange && (0, _isString2.default)(newValue) && newValue !== this.props.value) {
                this.props.onChange(newValue);
            }
        }
    }, {
        key: 'onInputChange',
        value: function onInputChange(value) {
            if (this.props.onChange) {
                this.props.onChange(value);
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
                presetColors = _props.presetColors,
                colorPosition = _props.colorPosition;

            var Picker = components[pickerType];
            var color = ColorField.parse(value);

            var popoverStyle = {};
            if (colorPosition === 'left') {
                popoverStyle.left = '0%';
            } else if (colorPosition === 'right') {
                popoverStyle.right = '0%';
            }

            return _react2.default.createElement(
                _Popover2.default,
                {
                    className: styles.popover,
                    style: popoverStyle,
                    onClose: this.onClose
                },
                _react2.default.createElement(Picker, {
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
                withInput = _props2.withInput,
                other = (0, _objectWithoutProperties3.default)(_props2, ['pickerType', 'name', 'value', 'label', 'colors', 'disabled', 'presetColors', 'colorPosition', 'withInput']);
            var displayColorPicker = this.state.displayColorPicker;


            var color = ColorField.parse(value);

            var colorStyle = {
                background: value !== null ? 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + color.a + ')' : null
            };

            var formGroupClassName = (0, _classnames2.default)((_classNames = {}, (0, _defineProperty3.default)(_classNames, styles.formGroup, true), (0, _defineProperty3.default)(_classNames, 'form-group-color', true), _classNames));

            var buttonGroupClassName = (0, _classnames2.default)({
                'btn-group': !withInput,
                'input-group-btn': withInput
            });

            var buttonGroup = _react2.default.createElement(
                'div',
                { className: buttonGroupClassName },
                _react2.default.createElement(
                    'button',
                    {
                        type: 'button',
                        className: (0, _classnames2.default)({
                            btn: true,
                            'btn-default': true,
                            disabled: disabled
                        }),
                        disabled: disabled,
                        onClick: this.onClick
                    },
                    _react2.default.createElement('span', { className: styles.swatch, style: colorStyle })
                ),
                _react2.default.createElement(
                    'button',
                    {
                        type: 'button',
                        className: (0, _classnames2.default)({
                            btn: true,
                            'btn-default': true,
                            'btn-clear': true,
                            disabled: disabled
                        }),
                        disabled: value === null || disabled,
                        onClick: this.onClickClear
                    },
                    _react2.default.createElement('span', { className: 'fa fa-remove' })
                )
            );

            return _react2.default.createElement(
                _FormGroup2.default,
                (0, _extends3.default)({
                    name: name,
                    label: label,
                    className: formGroupClassName
                }, other),
                _react2.default.createElement(
                    'div',
                    { className: styles.container },
                    withInput ? _react2.default.createElement(
                        'div',
                        { className: 'input-group' },
                        _react2.default.createElement(_TextField2.default, (0, _extends3.default)({}, other, {
                            inputOnly: true,
                            value: value,
                            onChange: this.onInputChange
                        })),
                        buttonGroup
                    ) : buttonGroup,
                    displayColorPicker ? this.renderPopover() : null
                )
            );
        }
    }]);
    return ColorField;
}(_react.Component);

ColorField.propTypes = propTypes;
ColorField.defaultProps = defaultProps;

exports.default = ColorField;